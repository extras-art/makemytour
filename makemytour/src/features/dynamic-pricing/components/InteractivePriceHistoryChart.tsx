import React, { useState, useEffect, useMemo } from "react";
import { PriceHistoryEntry, PriceBreakdown } from "../types/pricing.types";
import { fetchPriceHistory, fetchPriceBreakdown, simulateDemandSurge } from "../api/pricingApi";
import { Zap, TrendingDown, TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react";

interface InteractivePriceHistoryChartProps {
  entityType: string;
  entityId: number;
  onSimulateSurge?: () => void;
}

export const InteractivePriceHistoryChart: React.FC<InteractivePriceHistoryChartProps> = ({
  entityType,
  entityId,
  onSimulateSurge,
}) => {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [surging, setSurging] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<PriceHistoryEntry | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [histData, bdownData] = await Promise.all([
        fetchPriceHistory(entityType, entityId),
        fetchPriceBreakdown(entityType, entityId),
      ]);
      setHistory(histData || []);
      setBreakdown(bdownData || null);
    } catch (e) {
      console.error("Failed to load price history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [entityType, entityId]);

  const handleSimulate = async () => {
    try {
      setSurging(true);
      await simulateDemandSurge(entityType, entityId);
      await loadData();
      if (onSimulateSurge) onSimulateSurge();
    } catch (e) {
      console.error("Surge simulation failed:", e);
    } finally {
      setSurging(false);
    }
  };

  // SVG Chart Dimensions & Calculations
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return null;

    const prices = history.map((d) => d.recordedPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const currentPrice = prices[prices.length - 1];

    const priceRange = maxPrice === minPrice ? 1 : maxPrice - minPrice;
    const yMin = Math.max(0, minPrice - priceRange * 0.15);
    const yMax = maxPrice + priceRange * 0.15;

    const effectiveWidth = width - padding.left - padding.right;
    const effectiveHeight = height - padding.top - padding.bottom;

    const points = history.map((d, index) => {
      const x = padding.left + (index / Math.max(1, history.length - 1)) * effectiveWidth;
      const y = height - padding.bottom - ((d.recordedPrice - yMin) / (yMax - yMin)) * effectiveHeight;
      return { x, y, entry: d };
    });

    const linePath = points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, "");

    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
      : "";

    return {
      points,
      linePath,
      areaPath,
      minPrice,
      maxPrice,
      currentPrice,
      yMin,
      yMax,
    };
  }, [history]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100 flex items-center justify-center min-h-[260px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            30-Day Price Trend & Volatility Index
          </h4>
          <p className="text-xs text-gray-500">Transparent historical rate movements with reason logs</p>
        </div>
        <button
          type="button"
          onClick={handleSimulate}
          disabled={surging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition shadow-sm disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${surging ? "animate-spin" : ""}`} />
          {surging ? "Simulating..." : "Simulate Demand Surge (+12%)"}
        </button>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden">
        {chartData && chartData.points.length > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={width - padding.right}
              y2={padding.top}
              stroke="#f3f4f6"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={(padding.top + height - padding.bottom) / 2}
              x2={width - padding.right}
              y2={(padding.top + height - padding.bottom) / 2}
              stroke="#f3f4f6"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke="#e5e7eb"
            />

            {/* Y-Axis Labels */}
            <text
              x={padding.left - 8}
              y={padding.top + 4}
              fontSize="10"
              fill="#9ca3af"
              textAnchor="end"
            >
              ₹{Math.round(chartData.yMax).toLocaleString("en-IN")}
            </text>
            <text
              x={padding.left - 8}
              y={(padding.top + height - padding.bottom) / 2 + 4}
              fontSize="10"
              fill="#9ca3af"
              textAnchor="end"
            >
              ₹{Math.round((chartData.yMin + chartData.yMax) / 2).toLocaleString("en-IN")}
            </text>
            <text
              x={padding.left - 8}
              y={height - padding.bottom + 4}
              fontSize="10"
              fill="#9ca3af"
              textAnchor="end"
            >
              ₹{Math.round(chartData.yMin).toLocaleString("en-IN")}
            </text>

            {/* Area and Line */}
            <path d={chartData.areaPath} fill="url(#priceGradient)" />
            <path
              d={chartData.linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#2563eb"
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:r-6 hover:fill-blue-600"
                  onMouseEnter={() => {
                    setHoveredPoint(pt.entry);
                    setTooltipPos({ x: pt.x, y: pt.y });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}

            {/* X-Axis Dates (sample 4 labels) */}
            {chartData.points
              .filter((_, idx, arr) => idx === 0 || idx === Math.floor(arr.length / 2) || idx === arr.length - 1)
              .map((pt, idx) => {
                const dateStr = new Date(pt.entry.recordedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={height - padding.bottom + 18}
                    fontSize="10"
                    fill="#6b7280"
                    textAnchor={idx === 0 ? "start" : idx === 2 ? "end" : "middle"}
                  >
                    {dateStr}
                  </text>
                );
              })}
          </svg>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs">
            No price history entries recorded yet.
          </div>
        )}

        {/* Hover Crosshair / Tooltip */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-gray-900/95 backdrop-blur text-white p-2.5 rounded-lg shadow-xl text-xs -translate-x-1/2 -translate-y-full -mt-2.5 transition-all min-w-[150px]"
            style={{
              left: `${(tooltipPos.x / width) * 100}%`,
              top: `${(tooltipPos.y / height) * 100}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-700">
              <span className="text-[10px] text-gray-400">
                {new Date(hoveredPoint.recordedAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="font-bold text-amber-400">
                ₹{hoveredPoint.recordedPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-gray-200">
              {hoveredPoint.primaryReason}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stat Pills */}
      {chartData && (
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-gray-100 text-center">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Lowest (30d)</span>
            <span className="text-sm font-black text-emerald-800">
              ₹{chartData.minPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-2">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Highest (30d)</span>
            <span className="text-sm font-black text-rose-800">
              ₹{chartData.maxPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Current Rate</span>
            <span className="text-sm font-black text-blue-800">
              ₹{chartData.currentPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractivePriceHistoryChart;

