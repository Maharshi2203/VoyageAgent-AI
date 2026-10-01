import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User as UserIcon, 
  CheckCircle2, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { Trip, Activity, ActivityType } from '../../types';
import { aiAssistantService } from '../../services/aiAssistantService';

interface TripAIAssistantDrawerProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const TripAIAssistantDrawer: React.FC<TripAIAssistantDrawerProps> = ({
  trip,
  isOpen,
  onClose,
  onUpdateTrip
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_init',
      sender: 'ai',
      text: `Hello! I'm your in-trip Copilot for ${trip.destination}. Ask me to review your schedule, check expenses, find local spots, or tweak Day plans.`,
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickPrompts = [
    "How much have I spent so far?",
    "What's my next booking?",
    "Add an evening ramen spot to Day 1",
    "What should I pack for this trip?"
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await aiAssistantService.processTripAssistantCommand(trip, query);

      // Execute structured actions if returned
      if (response.actionType === 'ADD_ACTIVITY' && response.payload) {
        const p = response.payload;
        const targetDayNum = p.day || 1;
        const newAct: Activity = {
          id: `act_${Date.now()}`,
          name: p.activity.name,
          description: p.activity.description || 'Added by AI Copilot',
          timeSlot: p.activity.timeSlot || 'Afternoon',
          cost: p.activity.cost || 0,
          location: p.activity.location || trip.destination,
          activityType: p.activity.activityType || ActivityType.CULTURAL,
          coordinates: trip.destinationCoords
        };

        onUpdateTrip(prev => {
          const days = prev.itinerary.days.map(d => {
            if (d.day !== targetDayNum) return d;
            const newActs = [...d.activities, newAct];
            const actsTotal = newActs.reduce((s, a) => s + a.cost, 0);
            return { ...d, activities: newActs, dailyTotal: actsTotal + d.accommodationCost };
          });
          const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);
          return {
            ...prev,
            itinerary: { ...prev.itinerary, days, grandTotal, remainingBudget: prev.totalBudget - grandTotal }
          };
        });
      } else if (response.actionType === 'GENERATE_PACKING' && response.payload?.items) {
        onUpdateTrip(prev => ({
          ...prev,
          packingList: [...prev.packingList, ...response.payload.items]
        }));
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "I analyzed your trip data, but encountered an unexpected error. Your saved itinerary remains fully intact.",
          time: 'Just now'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[130] bg-space-main/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-space-card z-[140] shadow-2xl border-l border-space-border flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-space-border flex items-center justify-between bg-space-secondary/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-space-main flex items-center justify-center shadow-md">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg text-typo-primary tracking-tight">Voyage Copilot</h3>
              <p className="text-[10px] font-bold text-brand-glow uppercase tracking-wider">Ground-Truth Trip Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-space-card hover:bg-space-secondary text-typo-muted hover:text-typo-primary border border-space-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                msg.sender === 'user' 
                  ? 'bg-space-secondary text-brand-primary border border-space-border' 
                  : 'bg-brand-primary text-space-main shadow-md'
              }`}>
                {msg.sender === 'user' ? 'You' : <Sparkles size={14} />}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-primary text-space-main rounded-tr-none'
                  : 'bg-space-secondary text-typo-primary border border-space-border/80 rounded-tl-none'
              }`}>
                {msg.text}
                <span className={`block text-[9px] mt-1.5 font-bold ${
                  msg.sender === 'user' ? 'text-space-main/60' : 'text-typo-muted'
                }`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 text-brand-glow text-xs font-bold pl-11">
              <RefreshCw size={14} className="animate-spin" />
              <span>Analyzing trip structure...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts & Input Bar */}
        <div className="p-4 border-t border-space-border bg-space-secondary/40 space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-xl bg-space-card border border-space-border text-typo-secondary hover:text-brand-primary hover:border-brand-primary/50 transition-all"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              placeholder="Ask Copilot or command a change..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-space-card border-2 border-space-border focus:border-brand-primary rounded-2xl py-3 px-4 text-xs font-semibold text-typo-primary outline-none transition-all placeholder:text-typo-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="p-3 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main transition-all disabled:opacity-40 shadow-md"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </>
  );
};
