import type { Trade } from "../types.ts";
import { exportTradesCSV, readFileAsText, parseCSV } from "../utils/csv.ts";
import { calculateEquityAtIndex } from "../utils/metrics.ts";

interface TradeTableProps {
	trades: Trade[];
	initialEquity: number;
	tradeFee: number;
	onDelete: (id: number) => void;
	onImport: (trades: Trade[]) => void;
}

export default function TradeTable({
	trades,
	initialEquity,
	tradeFee,
	onDelete,
	onImport,
}: TradeTableProps) {
	const handleExport = () => exportTradesCSV(trades);

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

	const eqAtIndex = (index: number) =>
		calculateEquityAtIndex(trades, index, initialEquity, tradeFee / 100);

	return (
		<div className="panel">
			<div className="panel-header">
				<h3>📋 Trade Log</h3>
				<div className="panel-actions">
					<button
						className="btn btn-sm"
						onClick={handleExport}
						disabled={trades.length === 0}
					>
						📤 Export CSV
					</button>
					<button
						className="btn btn-sm"
						onClick={() => document.getElementById("csvInput")?.click()}
					>
						📥 Import CSV
					</button>
					<input
						id="csvInput"
						type="file"
						accept=".csv"
						style={{ display: "none" }}
						onChange={handleImport}
					/>
				</div>
			</div>
			<div className="panel-body">
				<div className="table-wrap">
					{trades.length === 0 ? (
						<div className="empty-state">
							<div className="empty-icon">📊</div>
							<div>
								No trades yet. Click on the chart to add your first signal.
							</div>
						</div>
					) : (
						<table>
							<thead>
								<tr>
									<th>#</th>
									<th>Date</th>
									<th>Action</th>
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
								{trades.map((t, i) => {
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
					)}
				</div>
			</div>
		</div>
	);
}
