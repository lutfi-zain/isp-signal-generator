import { useState, useCallback, useMemo } from "react";
import type { Trade, Candle, Metrics, ReplayResult } from "../types.ts";
import { computeMetrics, replayTrades } from "../utils/metrics.ts";

interface UsePortfolioResult {
	trades: Trade[];
	initialEquity: number;
	tradeFee: number;
	btcHeld: number;
	cashBalance: number;
	currentEquity: number;
	metrics: Metrics;
	replay: ReplayResult;
	setInitialEquity: (v: number) => void;
	setTradeFee: (v: number) => void;
	addTrade: (
		action: "BUY" | "SELL",
		price: number,
		equityPct: number,
		date: number,
	) => void;
	deleteTrade: (id: number) => void;
	clearTrades: () => void;
	importTrades: (trades: Trade[]) => void;
}

export function usePortfolio(candles: Candle[]): UsePortfolioResult {
	const [trades, setTrades] = useState<Trade[]>([]);
	const [initialEquity, setInitialEquity] = useState(10000);
	const [tradeFee, setTradeFee] = useState(0.1);

	const addTrade = useCallback(
		(
			action: "BUY" | "SELL",
			price: number,
			equityPct: number,
			date: number,
		) => {
			setTrades((prev) => {
				// Replay all previous trades to get current state
				let cash = initialEquity;
				let btc = 0;
				const fee = tradeFee / 100;

				for (const t of prev) {
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

				// Apply the new trade
				const availEq = cash + btc * price;
				let cost = 0;

				if (action === "BUY") {
					const totalCost = Math.min(availEq * (equityPct / 100), cash);
					const feeAmt = totalCost * fee;
					btc += (totalCost - feeAmt) / price;
					cash -= totalCost;
					cost = totalCost;
				} else if (btc > 0) {
					const portion = equityPct / 100;
					const btcToSell = btc * portion;
					const gross = btcToSell * price;
					cash += gross - gross * fee;
					btc -= btcToSell;
					cost = gross;
				}

				const totalEquity = cash + btc * price;

				const trade: Trade = {
					id: Date.now() + Math.random(),
					date,
					action,
					price,
					equityPct,
					cost: Math.round(cost * 100) / 100,
					btcHeld: Math.round(btc * 1e8) / 1e8,
					totalEquity: Math.round(totalEquity * 100) / 100,
				};

				return [...prev, trade];
			});
		},
		[initialEquity, tradeFee],
	);

	const deleteTrade = useCallback((id: number) => {
		setTrades((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const clearTrades = useCallback(() => {
		setTrades([]);
	}, []);

	const importTrades = useCallback((newTrades: Trade[]) => {
		setTrades(newTrades);
	}, []);

	// Derive btcHeld, cashBalance, currentEquity from trades
	const { btcHeld, cashBalance, currentEquity } = useMemo(() => {
		let cash = initialEquity;
		let btc = 0;
		const fee = tradeFee / 100;

		for (const t of trades) {
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

		const lastPrice =
			trades.length > 0
				? trades[trades.length - 1].price
				: candles.length > 0
					? candles[candles.length - 1].close
					: 0;

		const equity = cash + btc * lastPrice;
		return {
			btcHeld: Math.round(btc * 1e8) / 1e8,
			cashBalance: Math.round(cash * 100) / 100,
			currentEquity: Math.round(equity * 100) / 100,
		};
	}, [trades, initialEquity, tradeFee, candles]);

	const metrics = useMemo(
		() => computeMetrics(candles, trades, initialEquity, tradeFee / 100),
		[candles, trades, initialEquity, tradeFee],
	);

	const replay = useMemo(
		() => replayTrades(candles, trades, initialEquity, tradeFee / 100),
		[candles, trades, initialEquity, tradeFee],
	);

	return {
		trades,
		initialEquity,
		tradeFee,
		btcHeld,
		cashBalance,
		currentEquity,
		metrics,
		replay,
		setInitialEquity,
		setTradeFee,
		addTrade,
		deleteTrade,
		clearTrades,
		importTrades,
	};
}
