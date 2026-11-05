import React, { useState, useEffect } from "react";
import { PriceBreakdown } from "../types/pricing.types";
import { fetchPriceBreakdown } from "../api/pricingApi";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PriceTransparencyBadgeProps {
  entityType: string;
  entityId: number;
  compact?: boolean;
  initialBreakdown?: PriceBreakdown | null;
}

export const PriceTransparencyBadge: React.FC<PriceTransparencyBadgeProps> = ({
  entityType,
  entityId,
  compact = false,
  initialBreakdown,
}) => {
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(initialBreakdown || null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialBreakdown) {
      setBreakdown(initialBreakdown);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetchPriceBreakdown(entityType, entityId)
      .then((data) => {
        if (isMounted) setBreakdown(data);
      })
      .catch((err) => console.error("Error fetching price breakdown:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entityType, entityId, initialBreakdown]);

  if (!breakdown) {
    return null;
  }

  const netPct =
    breakdown.basePrice > 0
      ? ((breakdown.finalPrice - breakdown.basePrice) / breakdown.basePrice) * 100
      : 0;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${
          netPct > 0
            ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            : netPct < 0
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
            : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          {netPct > 0 ? `+${Math.round(netPct)}% Dynamic Surge` : netPct < 0 ? `${Math.round(netPct)}% Saver Rate` : "Base Rate"}
        </span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 mt-2 w-80 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10 focus:outline-none -left-2 sm:left-0 transition-all text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-blue-600" />
              Dynamic Price Factors
            </span>
            <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Live Engine
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center text-gray-600">
              <span>Anchor Base Rate</span>
              <span className="font-bold text-gray-900">₹{breakdown.basePrice.toLocaleString("en-IN")}</span>
            </div>

            {breakdown.scarcityMultiplierPct !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seat / Room Scarcity</span>
                <span className={`font-semibold flex items-center gap-0.5 ${breakdown.scarcityMultiplierPct > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                  {breakdown.scarcityMultiplierPct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {breakdown.scarcityMultiplierPct > 0 ? `+${breakdown.scarcityMultiplierPct}%` : `${breakdown.scarcityMultiplierPct}%`}
                </span>
              </div>
            )}

            {breakdown.timeHorizonMultiplierPct !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Departure Horizon</span>
                <span className={`font-semibold flex items-center gap-0.5 ${breakdown.timeHorizonMultiplierPct > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                  {breakdown.timeHorizonMultiplierPct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {breakdown.timeHorizonMultiplierPct > 0 ? `+${breakdown.timeHorizonMultiplierPct}%` : `${breakdown.timeHorizonMultiplierPct}%`}
                </span>
              </div>
            )}

            {breakdown.seasonalMultiplierPct > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seasonal / Weekend Surge</span>
                <span className="font-semibold text-amber-700 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{breakdown.seasonalMultiplierPct}%
                </span>
              </div>
            )}

            {breakdown.demandMultiplierPct > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Demand Velocity</span>
                <span className="font-semibold text-amber-700 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +{breakdown.demandMultiplierPct}%
                </span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-sm">
              <span className="font-bold text-gray-900">Calculated Fare</span>
              <span className="font-black text-blue-600">₹{breakdown.finalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {breakdown.activeRuleBadges && breakdown.activeRuleBadges.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 pt-1">
              {breakdown.activeRuleBadges.map((badge, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-2 text-[11px] text-gray-500 leading-relaxed border border-gray-100">
            {breakdown.explanationSummary}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTransparencyBadge;

