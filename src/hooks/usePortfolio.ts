import { useState, useCallback, useMemo } from "react";
import type { Trade, Candle, Metrics, ReplayResult, MarketRegime, RegimeStats, RegimeTransition } from "../types.ts";
import { computeMetrics, replayTrades, computeRegimeStats } from "../utils/metrics.ts";

interface UsePortfolioResult {
	trades: Trade[];
	regimeTransitions: RegimeTransition[];
	initialEquity: number;
	tradeFee: number;
	btcHeld: number;
	cashBalance: number;
	currentEquity: number;
	metrics: Metrics;
	replay: ReplayResult;
	regimeStats: Record<MarketRegime, RegimeStats>;
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
	addRegimeTransition: (regime: MarketRegime, price: number, date: number) => void;
	deleteRegimeTransition: (id: number) => void;
	clearRegimeTransitions: () => void;
	importRegimeTransitions: (transitions: RegimeTransition[]) => void;
}

export function usePortfolio(candles: Candle[]): UsePortfolioResult {
	const [trades, setTrades] = useState<Omit<Trade, "regime">[]>([]);
	const [regimeTransitions, setRegimeTransitions] = useState<RegimeTransition[]>([]);
	const [initialEquity, setInitialEquity] = useState(10000);
	const [tradeFee, setTradeFee] = useState(0.1);

	// Helper to resolve the active regime at any date
	const getActiveRegimeAtDate = useCallback((date: number) => {
		const sorted = [...regimeTransitions].sort((a, b) => a.date - b.date);
		let active: MarketRegime = "Neutral";
		for (const t of sorted) {
			if (t.date <= date) {
				active = t.regime;
			} else {
				break;
			}
		}
		return active;
	}, [regimeTransitions]);

	// Map trades with their active regime dynamically
	const tradesWithRegime = useMemo<Trade[]>(() => {
		return trades.map((t) => ({
			...t,
			regime: getActiveRegimeAtDate(t.date),
		})) as Trade[];
	}, [trades, getActiveRegimeAtDate]);

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

				const trade = {
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

	// Regime Transitions management
	const addRegimeTransition = useCallback((regime: MarketRegime, price: number, date: number) => {
		setRegimeTransitions((prev) => {
			const filtered = prev.filter((t) => t.date !== date);
			const newTransition: RegimeTransition = {
				id: Date.now() + Math.random(),
				date,
				regime,
				price,
			};
			return [...filtered, newTransition].sort((a, b) => a.date - b.date);
		});
	}, []);

	const deleteRegimeTransition = useCallback((id: number) => {
		setRegimeTransitions((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const clearRegimeTransitions = useCallback(() => {
		setRegimeTransitions([]);
	}, []);

	const importRegimeTransitions = useCallback((newTransitions: RegimeTransition[]) => {
		setRegimeTransitions(newTransitions);
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
		() => computeMetrics(candles, tradesWithRegime, initialEquity, tradeFee / 100),
		[candles, tradesWithRegime, initialEquity, tradeFee],
	);

	const replay = useMemo(
		() => replayTrades(candles, tradesWithRegime, initialEquity, tradeFee / 100),
		[candles, tradesWithRegime, initialEquity, tradeFee],
	);

	const regimeStats = useMemo(
		() => computeRegimeStats(tradesWithRegime, initialEquity, tradeFee / 100),
		[tradesWithRegime, initialEquity, tradeFee],
	);

	return {
		trades: tradesWithRegime,
		regimeTransitions,
		initialEquity,
		tradeFee,
		btcHeld,
		cashBalance,
		currentEquity,
		metrics,
		replay,
		regimeStats,
		setInitialEquity,
		setTradeFee,
		addTrade,
		deleteTrade,
		clearTrades,
		importTrades,
		addRegimeTransition,
		deleteRegimeTransition,
		clearRegimeTransitions,
		importRegimeTransitions,
	};
}
