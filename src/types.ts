/** A single daily OHLC candle */
export interface Candle {
	time: number; // Unix timestamp (seconds)
	open: number;
	high: number;
	low: number;
	close: number;
}

/** A trade signal (buy or sell) */
export interface Trade {
	id: number;
	date: number; // Unix timestamp (seconds)
	action: "BUY" | "SELL";
	price: number;
	equityPct: number; // percentage of equity used (5-100)
	cost: number; // dollar amount committed/received
	btcHeld: number; // BTC held after this trade
	totalEquity: number; // total equity after this trade
}

/** Replayed equity history point */
export interface EquityPoint {
	date: number;
	equity: number;
}

/** Computed performance metrics */
export interface Metrics {
	totalReturn: number;
	annualReturn: number;
	totalTrades: number;
	winRate: number;
	profitFactor: number;
	avgWinLoss: number;
	sharpe: number;
	sortino: number;
	calmar: number;
	maxDrawdown: number;
	maxDDPct: number;
	recoveryFactor: number;
	expectancy: number;
	kelly: number;
	volatility: number;
	ulcerIndex: number;
	sterling: number;
}

/** Result from replaying trades */
export interface ReplayResult {
	equityHistory: EquityPoint[];
	tradeReturns: number[];
}

/** Bitview API response shape for series data */
export interface SeriesResponse {
	version: number;
	index: string;
	type: string;
	start: number;
	end: number;
	stamp: string;
	data: number[][];
}
