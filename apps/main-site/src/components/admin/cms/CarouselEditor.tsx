"use client";

import React from "react";
import { CmsCarouselCard } from "./types";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

interface CarouselEditorProps {
  cards?: CmsCarouselCard[];
  data?: { cards?: CmsCarouselCard[] } | CmsCarouselCard[];
  onChange: (updatedCards: CmsCarouselCard[]) => void;
}

export default function CarouselEditor(props: CarouselEditorProps) {
  const { onChange } = props;
  const dataAsObj = props.data as { cards?: CmsCarouselCard[] } | undefined;
  const cards = Array.isArray(props.cards) 
    ? props.cards 
    : Array.isArray(dataAsObj?.cards) 
    ? dataAsObj?.cards 
    : Array.isArray(props.data) 
    ? props.data as CmsCarouselCard[]
    : [];

  const handleAddCard = () => {
    const newCard: CmsCarouselCard = {
      id: Date.now().toString(),
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      badge: "PERSPECTIVE",
      title: "Elevated Visual Focus",
      description: "Tailored view of custom luxury architecture.",
      isActive: true,
      sortOrder: cards.length,
    };
    onChange([...cards, newCard]);
  };

  const handleUpdateCard = (id: string, updatedFields: Partial<CmsCarouselCard>) => {
    const updated = cards.map((c: CmsCarouselCard) => (c.id === id ? { ...c, ...updatedFields } : c));
    onChange(updated);
  };

  const handleDeleteCard = (id: string) => {
    onChange(cards.filter((c: CmsCarouselCard) => c.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const newCards = [...cards];
    // swap
    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    // fix sort orders
    const mappedOrders = newCards.map((c, idx) => ({ ...c, sortOrder: idx }));
    onChange(mappedOrders);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controller */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/50">
          Shuffling Card Elements ({cards.length})
        </p>
        <button
          type="button"
          onClick={handleAddCard}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0983B0] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:bg-[#0E5A75] transition-all"
        >
          <Plus size={14} /> Add New Card
        </button>
      </div>

      {/* Row map */}
      <div className="space-y-4">
        {cards.map((card: CmsCarouselCard, index: number) => (
          <div
            key={card.id}
            className={`p-5 rounded-2xl border transition-all ${
              card.isActive
                ? "bg-white/40 dark:bg-black/20 border-black/10 dark:border-white/10"
                : "bg-black/5 dark:bg-white/5 border-dashed border-black/10 dark:border-white/10 opacity-60"
            }`}
          >
            <div className="flex gap-4 items-start">
              {/* Asset Preview & Reorder Actions */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-black/10 flex-shrink-0 border border-white/10 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.badge} className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, "up")}
                    className="p-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={index === cards.length - 1}
                    onClick={() => handleMove(index, "down")}
                    className="p-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              {/* Form Input Attributes */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
                      Badge Overline
                    </label>
                    <input
                      type="text"
                      value={card.badge}
                      onChange={(e) => handleUpdateCard(card.id, { badge: e.target.value })}
                      placeholder="e.g. ARCHITECTURE"
                      className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs font-bold uppercase text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
                      Card Target Image URL
                    </label>
                    <input
                      type="text"
                      value={card.image}
                      onChange={(e) => handleUpdateCard(card.id, { image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
                    Card Title Line
                  </label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleUpdateCard(card.id, { title: e.target.value })}
                    placeholder="Designed to merge seamlessly"
                    className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs font-bold text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 mb-1">
                    Card Description Line
                  </label>
                  <input
                    type="text"
                    value={card.description}
                    onChange={(e) => handleUpdateCard(card.id, { description: e.target.value })}
                    placeholder="with the mountain horizon"
                    className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white/60 dark:bg-black/30 text-xs text-[#053344] dark:text-white outline-none focus:border-[#0983B0]"
                  />
                </div>

                {/* Footer status buttons */}
                <div className="flex justify-between items-center pt-1 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleUpdateCard(card.id, { isActive: !card.isActive })}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                      card.isActive
                        ? "text-[#159665] hover:bg-[#159665]/10"
                        : "text-gray-400 hover:bg-gray-400/10"
                    }`}
                  >
                    {card.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{card.isActive ? "Active / Visible" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-red-500/60 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Remove Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
