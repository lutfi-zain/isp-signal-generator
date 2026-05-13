import { useState } from "react";

interface TradeModalProps {
	open: boolean;
	date: Date | null;
	price: number | null;
	availEquity: number;
	onClose: () => void;
	onTrade: (action: "BUY" | "SELL", equityPct: number) => void;
}

export default function TradeModal({
	open,
	date,
	price,
	availEquity,
	onClose,
	onTrade,
}: TradeModalProps) {
	const [portion, setPortion] = useState(50);

	if (!open) return null;

	const handlePortionSelect = (pct: number) => setPortion(pct);

	return (
		<div
			className="modal-overlay active"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal">
				<div className="modal-header">
					<h3>New Trade Signal</h3>
					<button className="modal-close" onClick={onClose}>
						&times;
					</button>
				</div>
				<div className="modal-body">
					<div className="trade-info">
						<div className="trade-info-item">
							<label>Date</label>
							<div className="value">
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
							<div className="value">
								{price !== null
									? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
									: "—"}
							</div>
						</div>
					</div>

					<div className="portion-selector">
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
				<div className="modal-footer">
					<button className="btn" onClick={onClose}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
