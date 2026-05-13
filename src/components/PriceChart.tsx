import { useEffect, useRef } from "react";
import {
	createChart,
	ColorType,
	type IChartApi,
	type ISeriesApi,
	type CandlestickData,
	type Time,
	PriceScaleMode,
} from "lightweight-charts";
import type { Candle, Trade } from "../types.ts";

interface PriceChartProps {
	candles: Candle[];
	trades: Trade[];
	logScale: boolean;
	onSetScale: (log: boolean) => void;
	onCandleClick: (time: number, price: number) => void;
	dataRange: string;
}

export default function PriceChart({
	candles,
	trades,
	logScale,
	onSetScale,
	onCandleClick,
	dataRange,
}: PriceChartProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

	// Initialize chart
	useEffect(() => {
		if (!containerRef.current) return;

		const chart = createChart(containerRef.current, {
			layout: {
				background: { type: ColorType.Solid, color: "#131722" },
				textColor: "#d1d4dc",
				fontSize: 11,
			},
			grid: {
				vertLines: { color: "#2a2e39" },
				horzLines: { color: "#2a2e39" },
			},
			crosshair: {
				mode: 0,
				vertLine: { color: "#758696", width: 1, style: 2 },
				horzLine: { color: "#758696", width: 1, style: 2 },
			},
			timeScale: {
				borderColor: "#2a2e39",
				timeVisible: false,
				secondsVisible: false,
				rightOffset: 12,
				barSpacing: 8,
				minBarSpacing: 2,
				fixLeftEdge: true,
				fixRightEdge: true,
			},
			rightPriceScale: {
				borderColor: "#2a2e39",
				scaleMargins: { top: 0.05, bottom: 0.25 },
				mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
			},
		});

		const series = chart.addCandlestickSeries({
			upColor: "#089981",
			downColor: "#f23645",
			borderUpColor: "#089981",
			borderDownColor: "#f23645",
			wickUpColor: "#089981",
			wickDownColor: "#f23645",
			priceFormat: { type: "price", precision: 2, minMove: 0.01 },
		});

		chartRef.current = chart;
		seriesRef.current = series;

		const ro = new ResizeObserver(() => {
			if (containerRef.current) {
				chart.resize(
					containerRef.current.clientWidth,
					containerRef.current.clientHeight,
				);
			}
		});
		ro.observe(containerRef.current);

		return () => {
			ro.disconnect();
			chart.remove();
			chartRef.current = null;
			seriesRef.current = null;
		};
	}, []);

	// Update data
	useEffect(() => {
		if (!seriesRef.current || candles.length === 0) return;
		const data: CandlestickData[] = candles.map((c) => ({
			time: c.time as Time,
			open: c.open,
			high: c.high,
			low: c.low,
			close: c.close,
		}));
		seriesRef.current.setData(data);
		chartRef.current?.timeScale().fitContent();
	}, [candles]);

	// Update scale mode
	useEffect(() => {
		if (!chartRef.current) return;
		chartRef.current.priceScale("right").applyOptions({
			mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal,
		});
	}, [logScale]);

	// Update markers
	useEffect(() => {
		if (!seriesRef.current) return;
		const markers = trades.map((t) => ({
			time: t.date as Time,
			position:
				t.action === "BUY" ? ("belowBar" as const) : ("aboveBar" as const),
			color: t.action === "BUY" ? "#089981" : "#f23645",
			shape: t.action === "BUY" ? ("arrowUp" as const) : ("arrowDown" as const),
			text: t.action,
			size: 1,
		}));
		seriesRef.current.setMarkers(markers);
	}, [trades]);

	// Click handler
	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;
		const handler = (param: {
			time?: Time;
			point?: { x: number; y: number };
		}) => {
			if (!param?.time) return;
			const time = Number(param.time);
			let closest = candles[0];
			let minDiff = Infinity;
			for (const c of candles) {
				const diff = Math.abs(c.time - time);
				if (diff < minDiff) {
					minDiff = diff;
					closest = c;
				}
			}
			if (closest) {
				onCandleClick(closest.time, closest.close);
			}
		};
		chart.subscribeClick(handler);
		return () => chart.unsubscribeClick(handler);
	}, [candles, onCandleClick]);

	return (
		<div className="chart-container">
			<div className="chart-header">
				<div className="symbol-info">
					<span className="symbol-name">BTCUSD</span>
					<span className="symbol-price">
						{candles.length > 0
							? `$${candles[candles.length - 1].close.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
							: "—"}
					</span>
				</div>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<div className="scale-toggle">
						<button
							className={!logScale ? "active" : ""}
							onClick={() => onSetScale(false)}
						>
							LIN
						</button>
						<button
							className={logScale ? "active" : ""}
							onClick={() => onSetScale(true)}
						>
							LOG
						</button>
					</div>
					<span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
						{dataRange || "No data"}
					</span>
				</div>
			</div>
			<div className="chart-wrapper">
				<div ref={containerRef} style={{ width: "100%", height: "100%" }} />
				{candles.length === 0 && (
					<div className="chart-loading">
						<div className="spinner" />
						<span>Loading market data...</span>
					</div>
				)}
			</div>
		</div>
	);
}
