interface StatusBarProps {
	candleCount: number;
	tradeCount: number;
	currentEquity: number;
	openBtc: number;
}

export default function StatusBar({
	candleCount,
	tradeCount,
	currentEquity,
	openBtc,
}: StatusBarProps) {
	return (
		<div className="status-bar">
			<div className="status-left">
				<span className="status-item">
					<span className="status-dot green" /> Bitview API
				</span>
				<span className="status-item">Candles: {candleCount}</span>
				<span className="status-item">Trades: {tradeCount}</span>
				<span className="status-item">
					Equity: $
					{currentEquity.toLocaleString(undefined, {
						minimumFractionDigits: 2,
					})}
				</span>
				{openBtc > 0 && (
					<span
						className="status-item"
						style={{ color: "var(--accent-yellow)" }}
					>
						Open: {openBtc.toFixed(6)} BTC
					</span>
				)}
			</div>
			<span className="status-msg success">Ready</span>
		</div>
	);
}
