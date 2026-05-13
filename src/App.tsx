import { useState, useCallback, useMemo } from "react";
import { useBitviewData } from "./hooks/useBitviewData.ts";
import { usePortfolio } from "./hooks/usePortfolio.ts";
import Header from "./components/Header.tsx";
import PriceChart from "./components/PriceChart.tsx";
import TradeModal from "./components/TradeModal.tsx";
import TradeTable from "./components/TradeTable.tsx";
import PerformanceMetrics from "./components/PerformanceMetrics.tsx";
import EquityCurve from "./components/EquityCurve.tsx";
import StatusBar from "./components/StatusBar.tsx";

export default function App() {
	const { candles, loading, error, reload } = useBitviewData();
	const portfolio = usePortfolio(candles);

	const [logScale, setLogScale] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalDate, setModalDate] = useState<Date | null>(null);
	const [modalPrice, setModalPrice] = useState<number | null>(null);

	// Data range string
	const dataRange = useMemo(() => {
		if (candles.length === 0) return "";
		const first = new Date(candles[0].time * 1000);
		const last = new Date(candles[candles.length - 1].time * 1000);
		return `${first.toLocaleDateString()} – ${last.toLocaleDateString()}`;
	}, [candles]);

	const handleCandleClick = useCallback((time: number, price: number) => {
		setModalDate(new Date(time * 1000));
		setModalPrice(price);
		setModalOpen(true);
	}, []);

	const handleTrade = useCallback(
		(action: "BUY" | "SELL", equityPct: number) => {
			if (modalPrice === null || modalDate === null) return;
			if (action === "SELL" && portfolio.btcHeld === 0) return;
			portfolio.addTrade(
				action,
				modalPrice,
				equityPct,
				Math.floor(modalDate.getTime() / 1000),
			);
			setModalOpen(false);
		},
		[modalPrice, modalDate, portfolio],
	);

	const handleCloseModal = useCallback(() => {
		setModalOpen(false);
	}, []);

	const handleImport = useCallback(
		(trades: import("./types.ts").Trade[]) => {
			portfolio.importTrades(trades);
		},
		[portfolio],
	);

	return (
		<>
			<Header
				currentPrice={
					candles.length > 0 ? candles[candles.length - 1].close : null
				}
				candleCount={candles.length}
				onReload={reload}
				reloading={loading}
				initialEquity={portfolio.initialEquity}
				tradeFee={portfolio.tradeFee}
				onEquityChange={portfolio.setInitialEquity}
				onFeeChange={portfolio.setTradeFee}
				onClearTrades={portfolio.clearTrades}
				hasTrades={portfolio.trades.length > 0}
			/>

			<main className="container">
				<PriceChart
					candles={candles}
					trades={portfolio.trades}
					logScale={logScale}
					onSetScale={setLogScale}
					onCandleClick={handleCandleClick}
					dataRange={dataRange}
				/>

				{error && (
					<div
						style={{
							background: "var(--accent-red)",
							color: "#fff",
							padding: "8px 16px",
							borderRadius: 6,
							marginBottom: 16,
							fontSize: 13,
						}}
					>
						Error loading data: {error}. Click "Load Data" to retry.
					</div>
				)}

				<div className="bottom-section">
					<TradeTable
						trades={portfolio.trades}
						initialEquity={portfolio.initialEquity}
						tradeFee={portfolio.tradeFee}
						onDelete={portfolio.deleteTrade}
						onImport={handleImport}
					/>
					<PerformanceMetrics metrics={portfolio.metrics} />
				</div>

				<EquityCurve
					history={portfolio.replay.equityHistory}
					initialEquity={portfolio.initialEquity}
					dataRange={dataRange}
				/>
			</main>

			<StatusBar
				candleCount={candles.length}
				tradeCount={portfolio.trades.length}
				currentEquity={portfolio.currentEquity}
				openBtc={portfolio.btcHeld}
			/>

			<TradeModal
				open={modalOpen}
				date={modalDate}
				price={modalPrice}
				availEquity={portfolio.currentEquity}
				onClose={handleCloseModal}
				onTrade={handleTrade}
			/>
		</>
	);
}
