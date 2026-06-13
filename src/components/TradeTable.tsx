import { useState } from "react";
import type { Trade, MarketRegime, RegimeTransition } from "../types.ts";
import {
	exportTradesCSV,
	readFileAsText,
	parseCSV,
	exportRegimesCSV,
	parseRegimesCSV,
} from "../utils/csv.ts";
import { calculateEquityAtIndex } from "../utils/metrics.ts";

interface TradeTableProps {
	trades: Trade[];
	regimeTransitions: RegimeTransition[];
	initialEquity: number;
	tradeFee: number;
	onDelete: (id: number) => void;
	onImport: (trades: Trade[]) => void;
	onDeleteRegime: (id: number) => void;
	onImportRegimes: (transitions: RegimeTransition[]) => void;
}

export default function TradeTable({
	trades,
	regimeTransitions,
	initialEquity,
	tradeFee,
	onDelete,
	onImport,
	onDeleteRegime,
	onImportRegimes,
}: TradeTableProps) {
	const [activeTab, setActiveTab] = useState<"trades" | "regimes">("trades");
	const [regimeFilter, setRegimeFilter] = useState<string>("All");

	const handleExportTrades = () => exportTradesCSV(trades);
	const handleExportRegimes = () => exportRegimesCSV(regimeTransitions);

	const handleImportTrades = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const text = await readFileAsText(file);
			const parsed = parseCSV(text);
			if (parsed) {
				onImport(parsed);
			}
		} catch {
			// ignore
		}
		e.target.value = "";
	};

	const handleImportRegimes = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const text = await readFileAsText(file);
			const parsed = parseRegimesCSV(text);
			if (parsed) {
				onImportRegimes(parsed);
			}
		} catch {
			// ignore
		}
		e.target.value = "";
	};

	const eqAtIndex = (index: number) =>
		calculateEquityAtIndex(trades, index, initialEquity, tradeFee / 100);

	// Map trades with their original index to preserve P&L calculations when filtered
	const tradesWithOriginalIndex = trades.map((t, idx) => ({
		trade: t,
		originalIndex: idx,
	}));

	const filteredTrades = regimeFilter === "All"
		? tradesWithOriginalIndex
		: tradesWithOriginalIndex.filter(
				({ trade }) => (trade.regime || "Neutral") === regimeFilter
			);

	const getRegimeClass = (r: MarketRegime) => {
		return (r || "Neutral").toLowerCase().replace(" ", "-");
	};

	return (
		<div className="panel">
			<div className="panel-header" style={{ paddingBottom: 0, borderBottom: "1px solid var(--border-color)" }}>
				<div style={{ display: "flex", gap: 16 }}>
					<button
						className={`tab-btn ${activeTab === "trades" ? "active" : ""}`}
						onClick={() => setActiveTab("trades")}
						style={{
							background: "none",
							border: "none",
							borderBottom: activeTab === "trades" ? "2px solid var(--accent-blue)" : "2px solid transparent",
							color: activeTab === "trades" ? "var(--text-primary)" : "var(--text-secondary)",
							padding: "6px 4px 10px 4px",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "inherit",
						}}
					>
						📋 Trade Log
					</button>
					<button
						className={`tab-btn ${activeTab === "regimes" ? "active" : ""}`}
						onClick={() => setActiveTab("regimes")}
						style={{
							background: "none",
							border: "none",
							borderBottom: activeTab === "regimes" ? "2px solid var(--accent-blue)" : "2px solid transparent",
							color: activeTab === "regimes" ? "var(--text-primary)" : "var(--text-secondary)",
							padding: "6px 4px 10px 4px",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "inherit",
						}}
					>
						🎯 Regime Log
					</button>
				</div>

				<div className="panel-actions" style={{ paddingBottom: 6 }}>
					{activeTab === "trades" ? (
						<>
							<select
								value={regimeFilter}
								onChange={(e) => setRegimeFilter(e.target.value)}
								style={{
									background: "var(--bg-tertiary)",
									border: "1px solid var(--border-color)",
									color: "var(--text-primary)",
									borderRadius: 4,
									padding: "2px 6px",
									fontSize: 11,
									outline: "none",
									cursor: "pointer",
									marginRight: 6,
								}}
							>
								<option value="All">All Regimes</option>
								<option value="Strong Bull">Strong Bull</option>
								<option value="Weak Bull">Weak Bull</option>
								<option value="Neutral">Neutral</option>
								<option value="Weak Bear">Weak Bear</option>
								<option value="Strong Bear">Strong Bear</option>
							</select>
							<button
								className="btn btn-sm"
								onClick={handleExportTrades}
								disabled={trades.length === 0}
							>
								📤 Export CSV
							</button>
							<button
								className="btn btn-sm"
								onClick={() => document.getElementById("csvInputTrades")?.click()}
							>
								📥 Import CSV
							</button>
							<input
								id="csvInputTrades"
								type="file"
								accept=".csv"
								style={{ display: "none" }}
								onChange={handleImportTrades}
							/>
						</>
					) : (
						<>
							<button
								className="btn btn-sm"
								onClick={handleExportRegimes}
								disabled={regimeTransitions.length === 0}
							>
								📤 Export Regimes CSV
							</button>
							<button
								className="btn btn-sm"
								onClick={() => document.getElementById("csvInputRegimes")?.click()}
							>
								📥 Import Regimes CSV
							</button>
							<input
								id="csvInputRegimes"
								type="file"
								accept=".csv"
								style={{ display: "none" }}
								onChange={handleImportRegimes}
							/>
						</>
					)}
				</div>
			</div>
			<div className="panel-body">
				<div className="table-wrap">
					{activeTab === "trades" ? (
						filteredTrades.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">📊</div>
								<div>
									{trades.length === 0
										? "No trades yet. Click on the chart to add your first signal."
										: `No trades found with regime "${regimeFilter}".`}
								</div>
							</div>
						) : (
							<table>
								<thead>
									<tr>
										<th>#</th>
										<th>Date</th>
										<th>Action</th>
										<th>Regime</th>
										<th>Price (USD)</th>
										<th>Equity %</th>
										<th>Cost/Proceeds</th>
										<th>BTC Held</th>
										<th>Total Equity</th>
										<th>Change</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{filteredTrades.map(({ trade: t, originalIndex: i }) => {
										const eq = eqAtIndex(i);
										const prevEq = i > 0 ? eqAtIndex(i - 1) : initialEquity;
										const diff = eq - prevEq;
										const d = new Date(t.date * 1000);

										return (
											<tr key={t.id}>
												<td className="text-muted">{i + 1}</td>
												<td>
													{d.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</td>
												<td
													className={
														t.action === "BUY" ? "text-green" : "text-red"
													}
												>
													<strong>{t.action}</strong>
												</td>
												<td>
													<span className={`regime-badge ${getRegimeClass(t.regime)}`}>
														{t.regime || "Neutral"}
													</span>
												</td>
												<td>${t.price.toFixed(2)}</td>
												<td>{t.equityPct}%</td>
												<td>
													{t.action === "BUY" ? "-" : "+"}$
													{Math.abs(t.cost).toFixed(2)}
												</td>
												<td>{t.btcHeld.toFixed(6)}</td>
												<td
													className={
														eq >= initialEquity ? "text-green" : "text-red"
													}
												>
													${eq.toFixed(2)}
												</td>
												<td className={diff >= 0 ? "text-green" : "text-red"}>
													{diff >= 0 ? "+" : ""}${diff.toFixed(2)}
												</td>
												<td>
													<button
														className="btn btn-sm btn-danger"
														style={{ padding: "2px 6px", fontSize: 10 }}
														onClick={() => onDelete(t.id)}
													>
														✕
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)
					) : (
						regimeTransitions.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">🎯</div>
								<div>
									No regime transitions marked yet. Click on the chart, go to the "Market Regime" tab, and mark your transitions.
								</div>
							</div>
						) : (
							<table>
								<thead>
									<tr>
										<th>#</th>
										<th>Date</th>
										<th>Regime</th>
										<th>Price (USD)</th>
										<th />
									</tr>
								</thead>
								<tbody>
									{regimeTransitions.map((rt, i) => {
										const d = new Date(rt.date * 1000);

										return (
											<tr key={rt.id}>
												<td className="text-muted">{i + 1}</td>
												<td>
													{d.toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</td>
												<td>
													<span className={`regime-badge ${getRegimeClass(rt.regime)}`}>
														{rt.regime}
													</span>
												</td>
												<td>${rt.price.toFixed(2)}</td>
												<td>
													<button
														className="btn btn-sm btn-danger"
														style={{ padding: "2px 6px", fontSize: 10 }}
														onClick={() => onDeleteRegime(rt.id)}
													>
														✕
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)
					)}
				</div>
			</div>
		</div>
	);
}
