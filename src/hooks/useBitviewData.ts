import { useState, useEffect, useCallback } from "react";
import type { Candle } from "../types.ts";
import { fetchAllCandles } from "../utils/api.ts";

interface UseBitviewDataResult {
	candles: Candle[];
	loading: boolean;
	error: string | null;
	reload: () => void;
}

export function useBitviewData(): UseBitviewDataResult {
	const [candles, setCandles] = useState<Candle[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchAllCandles();
			setCandles(data);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Failed to load data");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	return { candles, loading, error, reload: load };
}
