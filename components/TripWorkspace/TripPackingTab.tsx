import React, { useState } from 'react';
import { 
  Luggage, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Circle,
  Filter
} from 'lucide-react';
import { Trip, PackingItem } from '../../types';
import { aiAssistantService } from '../../services/aiAssistantService';

interface TripPackingTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripPackingTab: React.FC<TripPackingTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<PackingItem['category']>('Clothing');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const categories: Array<PackingItem['category'] | 'All'> = [
    'All',
    'Clothing',
    'Toiletries',
    'Electronics',
    'Documents',
    'Medicine',
    'Accessories'
  ];

  const totalItems = trip.packingList.length;
  const packedItems = trip.packingList.filter(p => p.isPacked).length;
  const progressPercent = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const toggleItem = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      packingList: prev.packingList.map(item => 
        item.id === id ? { ...item, isPacked: !item.isPacked } : item
      )
    }));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: `pk_${Date.now()}`,
      tripId: trip.id,
      category: newItemCat,
      name: newItemName.trim(),
      isPacked: false
    };

    onUpdateTrip(prev => ({
      ...prev,
      packingList: [...prev.packingList, newItem]
    }));

    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      packingList: prev.packingList.filter(item => item.id !== id)
    }));
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const newItems = await aiAssistantService.generateSmartPackingList(
      trip.destination,
      trip.duration,
      ['culture', 'food', 'walking']
    );
    onUpdateTrip(prev => ({
      ...prev,
      packingList: newItems
    }));
    setIsRegenerating(false);
  };

  const filteredItems = trip.packingList.filter(item => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Smart Packing Checklist</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Dynamic packing suggestions adapted to {trip.destination}'s climate and {trip.duration} days of activity.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-5 py-2.5 rounded-2xl bg-space-card hover:bg-space-secondary border border-space-border text-xs font-bold text-typo-primary flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Sparkles size={14} className="text-brand-glow" />
          <span>{isRegenerating ? 'Generating...' : 'Re-generate with AI'}</span>
        </button>
      </div>

      {/* Progress Strip Card */}
      <div className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-glow">
              <Luggage size={20} />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-typo-primary">Packing Status</span>
              <p className="text-[11px] text-typo-muted font-bold">{packedItems} of {totalItems} items packed</p>
            </div>
          </div>
          <span className="text-2xl font-black text-brand-glow">{progressPercent}%</span>
        </div>

        <div className="w-full h-3 bg-space-secondary rounded-full overflow-hidden border border-space-border">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-glow transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Category Pills & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                  : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddItem} className="flex items-center gap-2">
          <input 
            type="text"
            placeholder="Add custom item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="bg-space-card border border-space-border rounded-xl px-4 py-2 text-xs font-bold text-typo-primary outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-brand-primary text-space-main hover:bg-brand-glow transition-all"
            title="Add item"
          >
            <Plus size={16} />
          </button>
        </form>
      </div>

      {/* Checklist Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
              item.isPacked 
                ? 'bg-space-secondary/40 border-space-border/50 text-typo-muted line-through opacity-75'
                : 'bg-space-card border-space-border hover:border-brand-primary/50 text-typo-primary shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                item.isPacked ? 'bg-brand-primary border-brand-primary text-space-main' : 'border-space-border'
              }`}>
                {item.isPacked && <Check size={13} />}
              </div>
              <span className="text-xs font-bold select-none">{item.name}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteItem(item.id);
              }}
              className="p-1 rounded text-typo-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
