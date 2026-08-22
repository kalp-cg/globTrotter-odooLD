"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTrip } from "@/lib/hooks/useTrips";
import { PaperSkeleton } from "@/components/ui/paper-skeleton";
import { StampButton } from "@/components/ui/stamp-button";
import * as Icons from "@/components/ui/icons";

interface PackingItem {
  id: string;
  category: "Documents" | "Clothing" | "Tech & Gear" | "Toiletries" | "Destination Specific";
  title: string;
  checked: boolean;
}

const DEFAULT_PACKING_ITEMS: PackingItem[] = [
  { id: "1", category: "Documents", title: "Passport / National ID & Visa copies", checked: true },
  { id: "2", category: "Documents", title: "Travel insurance confirmation & emergency contacts", checked: false },
  { id: "3", category: "Documents", title: "Flight tickets & hotel booking printouts", checked: false },
  { id: "4", category: "Tech & Gear", title: "Universal travel power adapter & power bank", checked: true },
  { id: "5", category: "Tech & Gear", title: "Noise-cancelling headphones & charging cables", checked: false },
  { id: "6", category: "Tech & Gear", title: "Camera / SD cards / travel tripod", checked: false },
  { id: "7", category: "Clothing", title: "Comfortable walking shoes (broken-in)", checked: true },
  { id: "8", category: "Clothing", title: "Weatherproof lightweight jacket & layers", checked: false },
  { id: "9", category: "Clothing", title: "Wrinkle-resistant shirts & travel pants", checked: false },
  { id: "10", category: "Toiletries", title: "TSA-approved refillable toiletry bottles", checked: true },
  { id: "11", category: "Toiletries", title: "Prescription medication & small first-aid pouch", checked: false },
  { id: "12", category: "Destination Specific", title: "Local transit cards / downloaded offline maps", checked: false },
];

export default function TripPackingPage() {
  const { id } = useParams() as { id: string };
  const { data: trip, isLoading } = useTrip(id);

  const [items, setItems] = useState<PackingItem[]>(DEFAULT_PACKING_ITEMS);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PackingItem["category"]>("Clothing");

  // Load saved checklist from localStorage
  useEffect(() => {
    if (trip?.id) {
      const saved = localStorage.getItem(`packing_list_${trip.id}`);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {}
      }
    }
  }, [trip?.id]);

  const saveItems = (updated: PackingItem[]) => {
    setItems(updated);
    if (trip?.id) {
      localStorage.setItem(`packing_list_${trip.id}`, JSON.stringify(updated));
    }
  };

  const toggleItem = (itemId: string) => {
    const updated = items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item);
    saveItems(updated);
  };

  const deleteItem = (itemId: string) => {
    const updated = items.filter(item => item.id !== itemId);
    saveItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem: PackingItem = {
      id: Date.now().toString(),
      category: selectedCategory,
      title: newItemTitle.trim(),
      checked: false,
    };

    saveItems([...items, newItem]);
    setNewItemTitle("");
  };

  const completedCount = useMemo(() => items.filter(i => i.checked).length, [items]);
  const progressPercent = Math.round((completedCount / Math.max(1, items.length)) * 100);

  const categories: PackingItem["category"][] = ["Documents", "Clothing", "Tech & Gear", "Toiletries", "Destination Specific"];

  if (isLoading) {
    return (
      <div className="w-full bg-paper border border-kraft/40 p-8 space-y-6">
        <PaperSkeleton className="w-1/3 h-12" />
        <PaperSkeleton className="w-full h-80" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="w-full bg-paper border border-kraft/40 p-12 text-center">
        <p className="font-display text-2xl text-ink/60">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-paper border border-kraft/50 shadow-2xl p-6 md:p-10 relative space-y-8"
         style={{ clipPath: "polygon(0% 0.3%, 100% 0%, 99.7% 99.7%, 0.3% 100%)" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-dashed border-kraft gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Travel Preparation</span>
          <h1 className="font-display text-3xl md:text-4xl text-ink mt-0.5">Packing Checklist</h1>
          <p className="font-body text-sm text-ink/70 mt-1">
            Tailored gear & essentials for {trip.name} ({trip.stops?.length || 0} stops).
          </p>
        </div>

        {/* Progress Badge */}
        <div className="bg-kraft/30 border-2 border-ink p-4 text-center min-w-[160px] shadow-sm"
             style={{ transform: "rotate(1.5deg)" }}
        >
          <span className="font-mono text-xs text-ink/60 uppercase block">Packed Progress</span>
          <span className="font-display text-2xl font-bold text-postal">{completedCount} / {items.length}</span>
          <div className="w-full bg-paper border border-ink/20 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-moss h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="bg-kraft/15 p-4 border border-kraft flex flex-col sm:flex-row items-center gap-3"
            style={{ transform: "rotate(-0.3deg)" }}
      >
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="bg-paper border-2 border-kraft px-3 py-2 font-display text-sm text-ink focus:outline-none focus:border-postal"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Add custom packing item (e.g. Hiking Boots, Rain Poncho)..."
          className="flex-1 bg-paper border-2 border-kraft px-3 py-2 font-body text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-postal"
        />

        <StampButton type="submit" variant="primary" className="shrink-0 text-sm py-2 px-4">
          + Add Item
        </StampButton>
      </form>

      {/* Grouped Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, cIdx) => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} className="bg-paper border-2 border-kraft p-5 shadow-sm space-y-3 relative"
                 style={{ transform: `rotate(${cIdx % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-dashed border-kraft">
                <h3 className="font-display text-xl text-ink font-bold">{cat}</h3>
                <span className="font-mono text-xs text-ink/50">
                  {catItems.filter(i => i.checked).length}/{catItems.length}
                </span>
              </div>

              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-2.5 border transition-all cursor-pointer select-none ${
                      item.checked
                        ? "bg-moss/10 border-moss/30 text-ink/50 line-through"
                        : "bg-paper border-kraft/70 hover:bg-kraft/10 text-ink"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 accent-moss cursor-pointer"
                      />
                      <span className="font-body text-sm font-medium">{item.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="text-ink/30 hover:text-postal text-xs font-mono px-1.5 py-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
