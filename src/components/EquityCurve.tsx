import { useEffect, useRef } from "react";
import {
	createChart,
	ColorType,
	type IChartApi,
	type ISeriesApi,
	type LineData,
	type Time,
} from "lightweight-charts";
import type { EquityPoint } from "../types.ts";

interface EquityCurveProps {
	history: EquityPoint[];
	initialEquity: number;
	dataRange: string;
}

export default function EquityCurve({
	history,
	initialEquity,
	dataRange,
}: EquityCurveProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<IChartApi | null>(null);
	const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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
			timeScale: {
				borderColor: "#2a2e39",
				timeVisible: false,
				fixLeftEdge: true,
				fixRightEdge: true,
			},
			rightPriceScale: {
				borderColor: "#2a2e39",
				scaleMargins: { top: 0.1, bottom: 0.1 },
			},
			height: 250,
		});

		const series = chart.addLineSeries({
			color: "#2962ff",
			lineWidth: 2,
			crosshairMarkerVisible: true,
			crosshairMarkerRadius: 4,
			priceFormat: { type: "price", precision: 2, minMove: 0.01 },
			lastValueVisible: true,
			priceLineVisible: false,
		});

		chartRef.current = chart;
		seriesRef.current = series;

		const ro = new ResizeObserver(() => {
			if (containerRef.current) {
				chart.resize(containerRef.current.clientWidth, 250);
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

	useEffect(() => {
		if (!seriesRef.current || history.length === 0) return;
		const data: LineData[] = history.map((h) => ({
			time: h.date as Time,
			value: h.equity,
		}));
		seriesRef.current.setData(data);

		// Add initial equity line
		try {
			seriesRef.current.createPriceLine({
				price: initialEquity,
				color: "#787b86",
				lineWidth: 1,
				lineStyle: 2, // Dashed
				axisLabelVisible: true,
				title: "Initial",
			});
		} catch {
			// may already exist, ignore
		}

		chartRef.current?.timeScale().fitContent();
	}, [history, initialEquity]);

	return (
		<div className="panel equity-section">
			<div className="panel-header">
				<h3>💰 Equity Curve</h3>
				<span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
					{dataRange}
				</span>
			</div>
			<div className="equity-chart-wrapper">
				<div ref={containerRef} style={{ width: "100%", height: "100%" }} />
				{history.length === 0 && (
					<div
						style={{
							position: "absolute",
							inset: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: "var(--text-muted)",
							fontSize: 13,
							pointerEvents: "none",
						}}
					>
						No trade data yet
					</div>
				)}
			</div>
		</div>
	);
}
