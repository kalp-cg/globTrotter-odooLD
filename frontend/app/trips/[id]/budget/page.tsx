"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/hooks/useTrips";
import { selectTripBudgetAnalysis } from "@/lib/selectors/budget";
import { formatCurrency, getSelectedCurrency, setSelectedCurrency, CurrencyCode, CURRENCY_RATES } from "@/lib/format/currency";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import * as Icons from "@/components/ui/icons";
import dynamic from "next/dynamic";

const CategoryPieChart = dynamic(() => import("@/components/ui/charts").then(mod => mod.CategoryPieChart), { ssr: false });
const DailyBarChart = dynamic(() => import("@/components/ui/charts").then(mod => mod.DailyBarChart), { ssr: false });

const BUDGET_KEY = (tripId: string) => `budget_targets_${tripId}`;

export default function BudgetPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>("USD");
  const [targets, setTargets] = useState({ transport: 0, stay: 0, meals: 0 });

  useEffect(() => {
    setCurrentCurrency(getSelectedCurrency());
    const handleCurr = () => setCurrentCurrency(getSelectedCurrency());
    window.addEventListener("currency_change", handleCurr);
    return () => window.removeEventListener("currency_change", handleCurr);
  }, []);

  useEffect(() => {
    if (!id) return;
    try {
      const saved = localStorage.getItem(BUDGET_KEY(id));
      if (saved) setTargets(JSON.parse(saved));
    } catch {}
  }, [id]);

  const saveTargets = (t: typeof targets) => {
    setTargets(t);
    if (id) localStorage.setItem(BUDGET_KEY(id), JSON.stringify(t));
  };

  const analysis = useMemo(() => selectTripBudgetAnalysis(trip), [trip]);

  const categoryData = useMemo(() => {
    const cats = [...analysis.categories];
    if (targets.transport > 0) {
      const ex = cats.find(c => c.name === "Transport");
      if (ex) ex.value += targets.transport; else cats.push({ name: "Transport", value: targets.transport });
    }
    if (targets.stay > 0) {
      const ex = cats.find(c => c.name === "Stay");
      if (ex) ex.value += targets.stay; else cats.push({ name: "Stay", value: targets.stay });
    }
    if (targets.meals > 0) {
      const ex = cats.find(c => c.name === "Meals");
      if (ex) ex.value += targets.meals; else cats.push({ name: "Meals", value: targets.meals });
    }
    return cats.filter(c => c.value > 0);
  }, [analysis.categories, targets]);

  const grandTotal = analysis.totalPlannedCost + targets.transport + targets.stay + targets.meals;
  const targetTotal = targets.transport + targets.stay + targets.meals;

  const dailyData = useMemo(() =>
    analysis.days.map(d => ({
      date: d.displayDate,
      cost: Math.round(d.totalCost),
      target: analysis.daysCount > 0 ? Math.round(targetTotal / analysis.daysCount) : 0,
      rawDate: d.dateKey,
    })),
  [analysis.days, analysis.daysCount, targetTotal]);

  if (isLoading) {
    return (
      <div className="w-full bg-paper min-h-[600px] shadow-2xl p-8 flex flex-col gap-8">
        <PaperSkeleton className="w-1/3 h-20" />
        <div className="flex gap-8">
          <PaperSkeleton className="w-1/2 h-[300px]" />
          <PaperSkeleton className="w-1/2 h-[300px]" />
        </div>
      </div>
    );
  }

  if (!trip) return <div className="p-10 text-center font-display text-2xl text-ink/50">Trip not found</div>;

  return (
    <div className="w-full bg-paper shadow-2xl relative flex flex-col font-display text-ink p-6 md:p-10">
      
      {/* Header Toolbar */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex justify-between items-center border-b-2 border-dashed border-kraft pb-2">
          <h1 className="text-3xl text-ink">GlobeTrotter</h1>
          <div className="flex items-center gap-2 border-2 border-kraft px-3 py-1 font-body text-sm bg-kraft/10">
            <span className="text-ink/60">Currency:</span>
            <select
              value={currentCurrency}
              onChange={e => { setSelectedCurrency(e.target.value as CurrencyCode); setCurrentCurrency(e.target.value as CurrencyCode); }}
              className="bg-transparent font-bold focus:outline-none"
            >
              {Object.entries(CURRENCY_RATES).map(([code, meta]) => (
                <option key={code} value={code} className="text-black">{meta.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <h2 className="text-3xl text-center mb-10 text-ink">Budget for a selected place</h2>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Manual Targets Block */}
        <div className="border-2 border-dashed border-kraft p-6 sm:p-8 bg-kraft/5" style={{ borderRadius: "8px" }}>
          <h3 className="text-xl mb-6 text-ink/80">Set Manual Section Budgets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {(["transport", "stay", "meals"] as const).map(key => (
              <div key={key} className="flex flex-col gap-2">
                <label className="text-lg capitalize text-ink/90">{key === "stay" ? "Accommodation" : key}</label>
                <div className="flex items-center border-2 border-kraft bg-paper px-4 py-2" style={{ borderRadius: "8px" }}>
                  <span className="font-mono text-ink/60">$</span>
                  <input
                    type="number" min={0}
                    value={targets[key] || ""}
                    onChange={e => saveTargets({ ...targets, [key]: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="flex-1 bg-transparent font-body text-lg outline-none ml-2 text-ink"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grand Total */}
        <div className="flex flex-col items-center py-6 border-y-2 border-dashed border-kraft">
          <span className="font-mono text-sm uppercase tracking-widest text-ink/60 mb-2">Estimated Total Trip Cost</span>
          <h2 className="text-6xl text-ink">
            {formatCurrency(grandTotal, currentCurrency)}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {[
              { label: "Activities", value: analysis.totalActivityCost },
              { label: "Transport", value: targets.transport },
              { label: "Stay", value: targets.stay },
              { label: "Meals", value: targets.meals },
            ].map(item => (
              <div key={item.label} className="border-2 border-kraft bg-paper px-6 py-3 text-center" style={{ borderRadius: "8px" }}>
                <span className="font-mono text-xs text-ink/60 block mb-1">{item.label}</span>
                <span className="text-xl text-ink">{formatCurrency(item.value, currentCurrency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        {categoryData.length > 0 || dailyData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-kraft/10 border-2 border-kraft p-6" style={{ borderRadius: "8px" }}>
            {categoryData.length > 0 && (
              <div className="relative text-black">
                <div className="text-lg text-ink/70 mb-4 border-b-2 border-kraft pb-2">By Category</div>
                <CategoryPieChart data={categoryData} />
              </div>
            )}
            {dailyData.length > 0 && (
              <div className="relative text-black">
                <div className="text-lg text-ink/70 mb-4 border-b-2 border-kraft pb-2">Daily Activity Costs</div>
                <DailyBarChart data={dailyData} />
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-kraft bg-kraft/10 rounded-lg">
            <Icons.Compass className="w-12 h-12 text-ink/30 mx-auto mb-3" />
            <p className="text-xl text-ink/60">No activities scheduled yet</p>
          </div>
        )}

      </div>
    </div>
  );
}
