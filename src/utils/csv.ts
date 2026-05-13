import type { Trade } from "../types.ts";

const CSV_HEADERS = [
	"Date",
	"Action",
	"Price",
	"EquityPct",
	"Cost",
	"BTCHeld",
	"TotalEquity",
];

/** Export trades as a CSV blob and trigger download */
export function exportTradesCSV(trades: Trade[]): void {
	if (trades.length === 0) return;

	const rows = trades.map((t) => {
		const d = new Date(t.date * 1000);
		return [
			d.toISOString().split("T")[0],
			t.action,
			t.price.toFixed(2),
			t.equityPct,
			t.cost.toFixed(2),
			t.btcHeld.toFixed(8),
			t.totalEquity.toFixed(2),
		].join(",");
	});

	const csv = CSV_HEADERS.join(",") + "\n" + rows.join("\n");
	const blob = new Blob([csv], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `isp-signals-btcusd-${new Date().toISOString().split("T")[0]}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

/** Parse CSV text into Trade objects. Returns null if parsing fails. */
export function parseCSV(text: string): Trade[] | null {
	const lines = text.trim().split("\n");
	if (lines.length < 2) return null;

	const trades: Trade[] = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		const parts = line.split(",");
		if (parts.length < 4) continue;

		const dateStr = parts[0].trim();
		const action = parts[1].trim().toUpperCase();
		const price = parseFloat(parts[2].trim());
		const equityPct = parseFloat(parts[3].trim());

		if (isNaN(price) || isNaN(equityPct)) continue;
		if (action !== "BUY" && action !== "SELL") continue;

		const d = new Date(dateStr);
		if (isNaN(d.getTime())) continue;

		trades.push({
			id: Date.now() + Math.random() + trades.length,
			date: Math.floor(d.getTime() / 1000),
			action,
			price,
			equityPct,
			cost: 0,
			btcHeld: 0,
			totalEquity: 0,
		});
	}

	return trades.length > 0 ? trades : null;
}

/** Read a File and return its text content */
export function readFileAsText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsText(file);
	});
}
