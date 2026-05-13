import type { Metrics } from "../types.ts";

interface PerformanceMetricsProps {
	metrics: Metrics;
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
}: PerformanceMetricsProps) {
	return (
		<div className="panel">
			<div className="panel-header">
				<h3>📈 Performance</h3>
			</div>
			<div className="panel-body">
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
			</div>
		</div>
	);
}
