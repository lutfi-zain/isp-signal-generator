import type { Candle, SeriesResponse } from "../types.ts";

const BASE = "https://bitview.space/api/series/price_ohlc/day";

async function fetchJson<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
	return res.json();
}

function dateFromIndex(idx: number, totalLen: number, refDate: Date): Date {
	const d = new Date(refDate);
	d.setDate(d.getDate() - (totalLen - 1 - idx));
	return d;
}

/** Fetch all daily OHLC candles from bitview.space */
export async function fetchAllCandles(): Promise<Candle[]> {
	// get total length
	const totalStr = await fetchJson<string>(`${BASE}/len`);
	const totalLen = parseInt(totalStr, 10);

	// get latest to determine reference date
	const latest = await fetchJson<SeriesResponse>(`${BASE}?start=-1`);
	const refDate = new Date(latest.stamp.split("T")[0] + "T00:00:00Z");

	// fetch in chunks of 2000
	const chunkSize = 2000;
	const chunks: number[][][] = [];

	for (let end = totalLen; end > 0; end -= chunkSize) {
		const start = Math.max(0, end - chunkSize);
		const resp = await fetchJson<SeriesResponse>(
			`${BASE}?start=${start}&end=${end}`,
		);
		chunks.unshift(resp.data);
	}

	const allData = chunks.flat();

	return allData.map((candle, i) => {
		const d = dateFromIndex(i, totalLen, refDate);
		return {
			time: Math.floor(d.getTime() / 1000),
			open: candle[0],
			high: candle[1],
			low: candle[2],
			close: candle[3],
		};
	});
}

/** Get total number of candles */
export async function getCandleCount(): Promise<number> {
	const totalStr = await fetchJson<string>(`${BASE}/len`);
	return parseInt(totalStr, 10);
}

/** Get latest candle */
export async function getLatestCandle(): Promise<Candle> {
	const resp = await fetchJson<SeriesResponse>(`${BASE}?start=-1`);
	const d = new Date(resp.stamp.split("T")[0] + "T00:00:00Z");
	const raw = resp.data[0];
	return {
		time: Math.floor(d.getTime() / 1000),
		open: raw[0],
		high: raw[1],
		low: raw[2],
		close: raw[3],
	};
}
