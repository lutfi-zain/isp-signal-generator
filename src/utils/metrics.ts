import type {
	Candle,
	Trade,
	Metrics,
	ReplayResult,
	EquityPoint,
} from "../types.ts";

/**
 * Replay all trades across OHLC data to generate a continuous equity curve.
 */
export function replayTrades(
	candles: Candle[],
	trades: Trade[],
	initialEquity: number,
	fee: number,
): ReplayResult {
	let cash = initialEquity;
	let btc = 0;

	const equityHistory: EquityPoint[] = [];
	const tradeReturns: number[] = [];

	if (candles.length === 0) {
		return {
			equityHistory: [{ date: Date.now() / 1000, equity: initialEquity }],
			tradeReturns: [],
		};
	}

	const sorted = [...trades].sort((a, b) => a.date - b.date);
	let tradeIdx = 0;

	for (const candle of candles) {
		while (tradeIdx < sorted.length && sorted[tradeIdx].date <= candle.time) {
			const t = sorted[tradeIdx];
			const availEq = cash + btc * t.price;

			if (t.action === "BUY") {
				const portion = t.equityPct / 100;
				const investAmt = Math.min(availEq * portion, cash);
				const feeAmt = investAmt * fee;
				const netInvest = investAmt - feeAmt;
				btc += netInvest / t.price;
				cash -= investAmt;
			} else if (btc > 0) {
				const portion = t.equityPct / 100;
				const btcToSell = btc * portion;
				const grossProceeds = btcToSell * t.price;
				const feeAmt = grossProceeds * fee;
				const netProceeds = grossProceeds - feeAmt;
				cash += netProceeds;
				btc -= btcToSell;
			}
			tradeIdx++;
		}

		const equity = cash + btc * candle.close;
		equityHistory.push({
			date: candle.time,
			equity: Math.round(equity * 100) / 100,
		});
	}

	// compute trade returns from buy→sell pairs
	let buyEquity: number | null = null;
	for (const t of sorted) {
		const idx = trades.indexOf(t);
		if (idx === -1) continue;
		const eq = calculateEquityAtIndex(trades, idx, initialEquity, fee);
		if (t.action === "BUY") {
			buyEquity = eq;
		} else if (t.action === "SELL" && buyEquity !== null && buyEquity > 0) {
			tradeReturns.push((eq - buyEquity) / buyEquity);
			buyEquity = null;
		}
	}

	return { equityHistory, tradeReturns };
}

/**
 * Compute equity at a given trade index by replaying all trades up to that index.
 */
export function calculateEquityAtIndex(
	trades: Trade[],
	index: number,
	initialEquity: number,
	fee: number,
): number {
	let cash = initialEquity;
	let btc = 0;

	for (let i = 0; i <= index && i < trades.length; i++) {
		const t = trades[i];
		if (t.action === "BUY") {
			const availEq = cash + btc * t.price;
			const portion = t.equityPct / 100;
			const investAmt = Math.min(availEq * portion, cash);
			const feeAmt = investAmt * fee;
			btc += (investAmt - feeAmt) / t.price;
			cash -= investAmt;
		} else if (btc > 0) {
			const portion = t.equityPct / 100;
			const btcToSell = btc * portion;
			const gross = btcToSell * t.price;
			cash += gross - gross * fee;
			btc -= btcToSell;
		}
	}

	const price = trades[index]?.price ?? 0;
	return cash + btc * price;
}

/** Compute daily returns from equity history */
function computeDailyReturns(history: EquityPoint[]): number[] {
	if (history.length < 2) return [];
	const returns: number[] = [];
	for (let i = 1; i < history.length; i++) {
		const prev = history[i - 1].equity;
		const curr = history[i].equity;
		if (prev > 0) returns.push((curr - prev) / prev);
	}
	return returns;
}

/** All performance metrics */
export function computeMetrics(
	candles: Candle[],
	trades: Trade[],
	initialEquity: number,
	fee: number,
): Metrics {
	const { equityHistory, tradeReturns } = replayTrades(
		candles,
		trades,
		initialEquity,
		fee,
	);
	const dailyReturns = computeDailyReturns(equityHistory);

	const totalTrades = trades.length;
	const finalEquity =
		equityHistory.length > 0
			? equityHistory[equityHistory.length - 1].equity
			: initialEquity;
	const totalReturn = finalEquity - initialEquity;
	const totalReturnPct = (finalEquity - initialEquity) / initialEquity;

	// Time period
	const firstDate = equityHistory[0]?.date ?? 0;
	const lastDate = equityHistory[equityHistory.length - 1]?.date ?? 0;
	const tradingDays = Math.max(1, (lastDate - firstDate) / 86400);
	const years = tradingDays / 365.25;
	const annualReturn = years > 0 ? (1 + totalReturnPct) ** (1 / years) - 1 : 0;

	// Win/loss analysis
	const closed = trades.filter((t) => t.action === "SELL").length;
	const wins = tradeReturns.filter((r) => r > 0);
	const losses = tradeReturns.filter((r) => r < 0);
	const winRate = closed > 0 ? wins.length / closed : 0;
	const avgWin =
		wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
	const avgLoss =
		losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
	const grossWin = wins.reduce((a, b) => a + b, 0);
	const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
	const profitFactor =
		grossLoss > 0 ? grossWin / grossLoss : wins.length > 0 ? Infinity : 0;
	const avgWinLoss =
		avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : avgWin > 0 ? Infinity : 0;

	// Daily return statistics
	const nonZero = dailyReturns.filter((r) => r !== 0);
	const avgDaily =
		nonZero.length > 0
			? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
			: 0;
	const stdDaily =
		nonZero.length > 1
			? Math.sqrt(
					nonZero.reduce((sum, r) => sum + (r - avgDaily) ** 2, 0) /
						(nonZero.length - 1),
				)
			: 0;
	const negReturns = nonZero.filter((r) => r < 0);
	const downsideDev =
		negReturns.length > 1
			? Math.sqrt(
					negReturns.reduce((sum, r) => sum + r * r, 0) / negReturns.length,
				)
			: 0;

	const rf = 0.04;
	const rfDaily = (1 + rf) ** (1 / 365) - 1;
	const excessReturn = avgDaily - rfDaily;

	const sharpe = stdDaily > 0 ? (excessReturn / stdDaily) * Math.sqrt(365) : 0;
	const sortino =
		downsideDev > 0 ? ((avgDaily - rfDaily) / downsideDev) * Math.sqrt(365) : 0;

	// Maximum drawdown
	let peak = initialEquity;
	let maxDD = 0;
	let maxDDPct = 0;
	for (const e of equityHistory) {
		if (e.equity > peak) peak = e.equity;
		const ddPct = (peak - e.equity) / peak;
		if (ddPct > maxDDPct) maxDDPct = ddPct;
		if (peak - e.equity > maxDD) maxDD = peak - e.equity;
	}

	const calmar = maxDDPct > 0 ? annualReturn / maxDDPct : 0;
	const recoveryFactor = maxDD > 0 ? Math.abs(totalReturn) / maxDD : 0;

	// Expectancy
	const expectancy =
		totalTrades > 0 ? winRate * avgWin - (1 - winRate) * Math.abs(avgLoss) : 0;

	// Kelly
	const kelly =
		avgLoss !== 0 ? winRate - (1 - winRate) / (avgWin / Math.abs(avgLoss)) : 0;

	// Volatility
	const volatility = stdDaily * Math.sqrt(365) * 100;

	// Ulcer index
	let maxEq = initialEquity;
	let ddSum = 0;
	let ddCount = 0;
	for (const e of equityHistory) {
		if (e.equity > maxEq) maxEq = e.equity;
		const pctDD = (maxEq - e.equity) / maxEq;
		ddSum += pctDD * pctDD;
		ddCount++;
	}
	const ulcerIndex = ddCount > 0 ? Math.sqrt(ddSum / ddCount) * 100 : 0;

	// Sterling ratio
	const avgDD = ddCount > 0 ? Math.sqrt(ddSum / ddCount) : 0;
	const sterling = avgDD > 0 ? annualReturn / (avgDD + 0.1) : 0;

	return {
		totalReturn,
		annualReturn: annualReturn * 100,
		totalTrades,
		winRate: winRate * 100,
		profitFactor,
		avgWinLoss,
		sharpe,
		sortino,
		calmar,
		maxDrawdown: maxDD,
		maxDDPct: maxDDPct * 100,
		recoveryFactor,
		expectancy,
		kelly: kelly * 100,
		volatility,
		ulcerIndex,
		sterling,
	};
}
