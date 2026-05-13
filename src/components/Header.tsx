interface HeaderProps {
	currentPrice: number | null;
	candleCount: number;
	onReload: () => void;
	reloading: boolean;
	initialEquity: number;
	tradeFee: number;
	onEquityChange: (v: number) => void;
	onFeeChange: (v: number) => void;
	onClearTrades: () => void;
	hasTrades: boolean;
}

export default function Header({
	currentPrice,
	candleCount,
	onReload,
	reloading,
	initialEquity,
	tradeFee,
	onEquityChange,
	onFeeChange,
	onClearTrades,
	hasTrades,
}: HeaderProps) {
	return (
		<header className="header">
			<div className="header-left">
				<div className="header-logo">
					<span>ISP</span> Signal Generator
				</div>
				<span className="header-badge">BTCUSD · Bitview.space</span>
			</div>
			<div className="header-right">
				<label>Initial Equity</label>
				<input
					className="header-input"
					type="number"
					value={initialEquity}
					min={100}
					step={1000}
					onChange={(e) => onEquityChange(parseFloat(e.target.value) || 10000)}
				/>
				<label style={{ marginLeft: 4 }}>Fee</label>
				<input
					className="header-input header-input-sm"
					type="number"
					value={tradeFee}
					min={0}
					step={0.05}
					onChange={(e) => onFeeChange(parseFloat(e.target.value) || 0)}
				/>
				<span style={{ fontSize: 11, color: "var(--text-muted)" }}>%</span>
				<button className="btn" onClick={onReload} disabled={reloading}>
					{reloading ? "⏳ Loading..." : "🔄 Load Data"}
				</button>
				{hasTrades && (
					<button className="btn btn-sm" onClick={onClearTrades}>
						🗑 Clear All
					</button>
				)}
				{currentPrice !== null && (
					<span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
						$
						{currentPrice.toLocaleString(undefined, {
							minimumFractionDigits: 2,
						})}
					</span>
				)}
				{candleCount > 0 && (
					<span style={{ fontSize: 11, color: "var(--text-muted)" }}>
						{candleCount} candles
					</span>
				)}
			</div>
		</header>
	);
}
