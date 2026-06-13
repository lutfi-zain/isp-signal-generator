import { useState } from "react";
import type { Metrics, MarketRegime, RegimeStats } from "../types.ts";

interface PerformanceMetricsProps {
	metrics: Metrics;
	regimeStats: Record<MarketRegime, RegimeStats>;
}

function MetricCard({
	label,
	value,
	isCurrency,
	suffix,
}: {
	label: string;
	value: number | null;
	isCurrency?: boolean;
	suffix?: string;
}) {
	const display = (() => {
		if (value === null || value === undefined || !isFinite(value)) return "—";
		if (isCurrency) {
			return (
				(value >= 0 ? "+" : "") +
				value.toLocaleString(undefined, {
					style: "currency",
					currency: "USD",
					minimumFractionDigits: 2,
				})
			);
		}
		return (value >= 0 ? "+" : "") + value.toFixed(2) + (suffix ?? "");
	})();

	const isPositive = value !== null && isFinite(value) && value >= 0;

	return (
		<div className="metric-card">
			<div className="metric-label">{label}</div>
			<div
				className={`metric-value${isPositive ? " positive" : value !== null && isFinite(value) ? " negative" : ""}`}
			>
				{display}
			</div>
		</div>
	);
}

const CARDS: {
	label: string;
	key: keyof Metrics;
	isCurrency?: boolean;
	suffix?: string;
}[] = [
	{ label: "Total Return", key: "totalReturn", isCurrency: true },
	{ label: "Annualized Return", key: "annualReturn", suffix: "%" },
	{ label: "Total Trades", key: "totalTrades" },
	{ label: "Win Rate", key: "winRate", suffix: "%" },
	{ label: "Profit Factor", key: "profitFactor" },
	{ label: "Avg Win / Avg Loss", key: "avgWinLoss" },
	{ label: "Sharpe Ratio", key: "sharpe" },
	{ label: "Sortino Ratio", key: "sortino" },
	{ label: "Calmar Ratio", key: "calmar" },
	{ label: "Max Drawdown", key: "maxDDPct", suffix: "%" },
	{ label: "Recovery Factor", key: "recoveryFactor" },
	{ label: "Expectancy", key: "expectancy" },
	{ label: "Kelly Criterion", key: "kelly", suffix: "%" },
	{ label: "Volatility (Ann.)", key: "volatility", suffix: "%" },
	{ label: "Ulcer Index", key: "ulcerIndex" },
	{ label: "Sterling Ratio", key: "sterling" },
];

export default function PerformanceMetrics({
	metrics,
	regimeStats,
}: PerformanceMetricsProps) {
	const [activeTab, setActiveTab] = useState<"summary" | "regimes">("summary");

	const regimes: MarketRegime[] = [
		"Strong Bull",
		"Weak Bull",
		"Neutral",
		"Weak Bear",
		"Strong Bear",
	];

	const getRegimeColor = (r: MarketRegime) => {
		switch (r) {
			case "Strong Bull":
				return "#11977e";
			case "Weak Bull":
				return "#1e8a80";
			case "Neutral":
				return "#8b8f9e";
			case "Weak Bear":
				return "#e38c10";
			case "Strong Bear":
				return "#dc3e4b";
		}
	};

	const getRegimeBg = (r: MarketRegime) => {
		switch (r) {
			case "Strong Bull":
				return "rgba(17, 151, 126, 0.08)";
			case "Weak Bull":
				return "rgba(30, 138, 128, 0.08)";
			case "Neutral":
				return "rgba(139, 143, 158, 0.08)";
			case "Weak Bear":
				return "rgba(227, 140, 16, 0.08)";
			case "Strong Bear":
				return "rgba(220, 62, 75, 0.08)";
		}
	};

	return (
		<div className="panel">
			<div className="panel-header" style={{ paddingBottom: 0, borderBottom: "1px solid var(--border-color)" }}>
				<div className="tabs" style={{ display: "flex", gap: 16 }}>
					<button
						className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
						onClick={() => setActiveTab("summary")}
						style={{
							background: "none",
							border: "none",
							borderBottom:
								activeTab === "summary"
									? "2px solid var(--accent-blue)"
									: "2px solid transparent",
							color:
								activeTab === "summary"
									? "var(--text-primary)"
									: "var(--text-secondary)",
							padding: "8px 4px 12px 4px",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "inherit",
						}}
					>
						📈 Summary
					</button>
					<button
						className={`tab-btn ${activeTab === "regimes" ? "active" : ""}`}
						onClick={() => setActiveTab("regimes")}
						style={{
							background: "none",
							border: "none",
							borderBottom:
								activeTab === "regimes"
									? "2px solid var(--accent-blue)"
									: "2px solid transparent",
							color:
								activeTab === "regimes"
									? "var(--text-primary)"
									: "var(--text-secondary)",
							padding: "8px 4px 12px 4px",
							fontSize: 13,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "inherit",
						}}
					>
						🎯 Regimes
					</button>
				</div>
			</div>
			<div className="panel-body">
				{activeTab === "summary" ? (
					<div className="metrics-grid">
						{CARDS.map((card) => (
							<MetricCard
								key={card.key}
								label={card.label}
								value={metrics[card.key] as number}
								isCurrency={card.isCurrency}
								suffix={card.suffix}
							/>
						))}
					</div>
				) : (
					<div
						style={{
							padding: 12,
							display: "flex",
							flexDirection: "column",
							gap: 8,
							maxHeight: "680px",
							overflowY: "auto",
						}}
					>
						{regimes.map((r) => {
							const stats = regimeStats?.[r] || {
								tradeCount: 0,
								winRate: 0,
								totalReturn: 0,
								avgReturnPct: 0,
								profitFactor: 0,
							};

							const hasTrades = stats.tradeCount > 0;
							const totalReturnStr =
								(stats.totalReturn >= 0 ? "+" : "") +
								stats.totalReturn.toLocaleString(undefined, {
									style: "currency",
									currency: "USD",
									minimumFractionDigits: 2,
								});

							return (
								<div
									key={r}
									style={{
										background: getRegimeBg(r),
										border: `1px solid ${hasTrades ? getRegimeColor(r) + "40" : "var(--border-color)"}`,
										borderRadius: 8,
										padding: "12px 14px",
										display: "flex",
										flexDirection: "column",
										gap: 6,
									}}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}
									>
										<span
											style={{
												color: getRegimeColor(r),
												fontWeight: 700,
												fontSize: 13,
											}}
										>
											{r}
										</span>
										<span
											style={{
												fontSize: 11,
												color: "var(--text-secondary)",
												background: "var(--bg-primary)",
												padding: "2px 6px",
												borderRadius: 4,
											}}
										>
											{stats.tradeCount}{" "}
											{stats.tradeCount === 1 ? "signal" : "signals"}
										</span>
									</div>
									{hasTrades ? (
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "1fr 1fr",
												gap: "8px 12px",
												marginTop: 4,
											}}
										>
											<div>
												<div
													style={{
														fontSize: 10,
														color: "var(--text-muted)",
														textTransform: "uppercase",
													}}
												>
													Net P&L
												</div>
												<div
													style={{
														fontSize: 13,
														fontWeight: 600,
														color:
															stats.totalReturn >= 0
																? "var(--accent-green)"
																: "var(--accent-red)",
													}}
												>
													{totalReturnStr}
												</div>
											</div>
											<div>
												<div
													style={{
														fontSize: 10,
														color: "var(--text-muted)",
														textTransform: "uppercase",
													}}
												>
													Win Rate
												</div>
												<div
													style={{
														fontSize: 13,
														fontWeight: 600,
														color: "var(--text-primary)",
													}}
												>
													{stats.winRate.toFixed(1)}%
												</div>
											</div>
											<div>
												<div
													style={{
														fontSize: 10,
														color: "var(--text-muted)",
														textTransform: "uppercase",
													}}
												>
													Avg Return
												</div>
												<div
													style={{
														fontSize: 13,
														fontWeight: 600,
														color:
															stats.avgReturnPct >= 0
																? "var(--accent-green)"
																: "var(--accent-red)",
													}}
												>
													{(stats.avgReturnPct >= 0 ? "+" : "") +
														stats.avgReturnPct.toFixed(2)}
													%
												</div>
											</div>
											<div>
												<div
													style={{
														fontSize: 10,
														color: "var(--text-muted)",
														textTransform: "uppercase",
													}}
												>
													Profit Factor
												</div>
												<div
													style={{
														fontSize: 13,
														fontWeight: 600,
														color: "var(--text-primary)",
													}}
												>
													{stats.profitFactor === Infinity
														? "∞"
														: stats.profitFactor.toFixed(2)}
												</div>
											</div>
										</div>
									) : (
										<div
											style={{
												fontSize: 11,
												color: "var(--text-muted)",
												fontStyle: "italic",
												marginTop: 2,
											}}
										>
											No signals logged.
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
