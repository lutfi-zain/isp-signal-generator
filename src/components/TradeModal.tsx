import { useState, useEffect } from "react";
import type { MarketRegime } from "../types.ts";

interface TradeModalProps {
	open: boolean;
	date: Date | null;
	price: number | null;
	availEquity: number;
	onClose: () => void;
	onTrade: (action: "BUY" | "SELL", equityPct: number) => void;
	onSetRegime: (regime: MarketRegime) => void;
}

export default function TradeModal({
	open,
	date,
	price,
	availEquity,
	onClose,
	onTrade,
	onSetRegime,
}: TradeModalProps) {
	const [activeTab, setActiveTab] = useState<"trade" | "regime">("trade");
	const [portion, setPortion] = useState(50);
	const [regime, setRegime] = useState<MarketRegime>("Neutral");

	// Reset values when modal opens
	useEffect(() => {
		if (open) {
			setPortion(50);
			setRegime("Neutral");
			setActiveTab("trade");
		}
	}, [open]);

	if (!open) return null;

	const handlePortionSelect = (pct: number) => setPortion(pct);

	const getRegimeColor = (r: MarketRegime) => {
		switch (r) {
			case "Strong Bull": return "#11977e";
			case "Weak Bull": return "#1e8a80";
			case "Neutral": return "#8b8f9e";
			case "Weak Bear": return "#e38c10";
			case "Strong Bear": return "#dc3e4b";
		}
	};

	const getRegimeBg = (r: MarketRegime) => {
		switch (r) {
			case "Strong Bull": return "rgba(17, 151, 126, 0.15)";
			case "Weak Bull": return "rgba(30, 138, 128, 0.15)";
			case "Neutral": return "rgba(139, 143, 158, 0.15)";
			case "Weak Bear": return "rgba(227, 140, 16, 0.15)";
			case "Strong Bear": return "rgba(220, 62, 75, 0.15)";
		}
	};

	return (
		<div
			className="modal-overlay active"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal">
				<div className="modal-header">
					<h3>Set Chart Event</h3>
					<button className="modal-close" onClick={onClose}>
						&times;
					</button>
				</div>
				<div className="modal-body">
					<div className="trade-info" style={{ marginBottom: 12 }}>
						<div className="trade-info-item">
							<label>Date</label>
							<div className="value" style={{ fontSize: 15 }}>
								{date
									? date.toLocaleDateString("en-US", {
											weekday: "short",
											year: "numeric",
											month: "short",
											day: "numeric",
										})
									: "—"}
							</div>
						</div>
						<div className="trade-info-item">
							<label>Price (USD)</label>
							<div className="value" style={{ fontSize: 15 }}>
								{price !== null
									? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
									: "—"}
							</div>
						</div>
					</div>

					{/* Tab selector */}
					<div className="tabs" style={{ display: "flex", gap: 16, marginBottom: 16, borderBottom: "1px solid var(--border-color)" }}>
						<button
							type="button"
							className={`tab-btn ${activeTab === "trade" ? "active" : ""}`}
							onClick={() => setActiveTab("trade")}
							style={{
								flex: 1,
								background: "none",
								border: "none",
								borderBottom: activeTab === "trade" ? "2px solid var(--accent-blue)" : "2px solid transparent",
								color: activeTab === "trade" ? "var(--text-primary)" : "var(--text-secondary)",
								padding: "8px 4px 12px 4px",
								fontSize: 13,
								fontWeight: 600,
								cursor: "pointer",
								fontFamily: "inherit",
							}}
						>
							💰 Trade Signal
						</button>
						<button
							type="button"
							className={`tab-btn ${activeTab === "regime" ? "active" : ""}`}
							onClick={() => setActiveTab("regime")}
							style={{
								flex: 1,
								background: "none",
								border: "none",
								borderBottom: activeTab === "regime" ? "2px solid var(--accent-blue)" : "2px solid transparent",
								color: activeTab === "regime" ? "var(--text-primary)" : "var(--text-secondary)",
								padding: "8px 4px 12px 4px",
								fontSize: 13,
								fontWeight: 600,
								cursor: "pointer",
								fontFamily: "inherit",
							}}
						>
							🎯 Market Regime
						</button>
					</div>

					{activeTab === "trade" ? (
						<div className="tab-pane">
							<div className="portion-selector" style={{ marginBottom: 20 }}>
								<label>Equity Allocation</label>
								<div className="portion-btns">
									{[25, 50, 75, 100].map((pct) => (
										<button
											key={pct}
											className={`btn btn-sm${portion === pct ? " active" : ""}`}
											onClick={() => handlePortionSelect(pct)}
										>
											{pct}%
										</button>
									))}
								</div>
								<div className="portion-custom">
									<input
										type="range"
										min={5}
										max={100}
										value={portion}
										onChange={(e) => setPortion(parseInt(e.target.value))}
									/>
									<span className="pct-value">{portion}%</span>
								</div>
								<div
									style={{
										marginTop: 8,
										fontSize: 12,
										color: "var(--text-secondary)",
									}}
								>
									Available equity:{" "}
									<strong>
										$
										{availEquity.toLocaleString(undefined, {
											minimumFractionDigits: 2,
										})}
									</strong>
								</div>
							</div>

							<div style={{ display: "flex", gap: 8 }}>
								<button
									className="btn btn-success"
									style={{ flex: 1, padding: 10, fontSize: 14, fontWeight: 700 }}
									onClick={() => onTrade("BUY", portion)}
								>
									▲ BUY
								</button>
								<button
									className="btn btn-danger"
									style={{ flex: 1, padding: 10, fontSize: 14, fontWeight: 700 }}
									onClick={() => onTrade("SELL", portion)}
								>
									▼ SELL
								</button>
							</div>
						</div>
					) : (
						<div className="tab-pane">
							<div className="regime-selector" style={{ marginBottom: 20 }}>
								<label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
									Select Regime starting from this date:
								</label>
								<div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
									{(["Strong Bull", "Weak Bull", "Neutral", "Weak Bear", "Strong Bear"] as MarketRegime[]).map((r) => {
										const isSelected = regime === r;
										const color = getRegimeColor(r);
										const bgActive = getRegimeBg(r);
										const activeBorder = color;

										return (
											<button
												key={r}
												type="button"
												onClick={() => setRegime(r)}
												style={{
													background: isSelected ? bgActive : "var(--bg-primary)",
													border: `1px solid ${isSelected ? activeBorder : "var(--border-color)"}`,
													color: isSelected ? color : "var(--text-secondary)",
													padding: "10px 2px",
													borderRadius: 6,
													fontSize: "10px",
													fontWeight: isSelected ? 700 : 500,
													cursor: "pointer",
													transition: "all 0.15s",
													textAlign: "center",
												}}
											>
												{r}
											</button>
										);
									})}
								</div>
							</div>

							<button
								className="btn btn-primary"
								style={{ width: "100%", padding: 10, fontSize: 14, fontWeight: 700 }}
								onClick={() => onSetRegime(regime)}
							>
								Set Regime Transition
							</button>
						</div>
					)}
				</div>
				<div className="modal-footer">
					<button className="btn" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
