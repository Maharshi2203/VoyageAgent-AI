import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Edit3, 
  ExternalLink,
  Bed,
  List,
  Columns
} from 'lucide-react';
import { Trip, DayPlan, Activity, ActivityType, User } from '../../types';
import { notificationService } from '../../services/email/notificationService';

interface TripItineraryTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
  onSelectActivity: (activity: Activity) => void;
}

export const TripItineraryTab: React.FC<TripItineraryTabProps> = ({
  trip,
  onUpdateTrip,
  onSelectActivity
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline');
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState<number | null>(null);

  // New activity form states
  const [newActName, setNewActName] = useState('');
  const [newActDesc, setNewActDesc] = useState('');
  const [newActSlot, setNewActSlot] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [newActCost, setNewActCost] = useState(0);
  const [newActLocation, setNewActLocation] = useState('');
  const [newActType, setNewActType] = useState<ActivityType>(ActivityType.CULTURAL);

  // Move activity within day
  const moveActivity = (dayIndex: number, actIndex: number, direction: 'up' | 'down') => {
    onUpdateTrip(prev => {
      const days = [...prev.itinerary.days];
      const targetDay = { ...days[dayIndex], activities: [...days[dayIndex].activities] };
      const targetIndex = direction === 'up' ? actIndex - 1 : actIndex + 1;

      if (targetIndex < 0 || targetIndex >= targetDay.activities.length) return prev;

      const temp = targetDay.activities[actIndex];
      targetDay.activities[actIndex] = targetDay.activities[targetIndex];
      targetDay.activities[targetIndex] = temp;

      days[dayIndex] = targetDay;
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          days
        }
      };
    });
  };

  // Delete activity
  const deleteActivity = (dayIndex: number, actId: string) => {
    onUpdateTrip(prev => {
      const days = prev.itinerary.days.map((d, dIdx) => {
        if (dIdx !== dayIndex) return d;
        const newActs = d.activities.filter(a => a.id !== actId);
        const actsCost = newActs.reduce((s, a) => s + a.cost, 0);
        return {
          ...d,
          activities: newActs,
          dailyTotal: actsCost + d.accommodationCost
        };
      });

      const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          days,
          grandTotal,
          remainingBudget: prev.totalBudget - grandTotal
        }
      };
    });

    const ownerMember = trip.members.find(m => m.role === 'owner') || trip.members[0];
    const userObj: User = {
      id: trip.userId,
      name: ownerMember?.name || 'Explorer',
      email: ownerMember?.email || 'traveler@voyage.ai'
    };
    notificationService.sendItineraryUpdateDebounced(userObj, trip, `Activity removed from Day ${dayIndex + 1}`);
  };

  // Add custom activity
  const handleAddActivity = (dayIndex: number) => {
    if (!newActName.trim()) return;

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      name: newActName.trim(),
      description: newActDesc.trim() || 'Custom itinerary activity added by traveler.',
      timeSlot: newActSlot,
      cost: Number(newActCost) || 0,
      location: newActLocation.trim() || trip.destination,
      activityType: newActType,
      coordinates: trip.destinationCoords
    };

    onUpdateTrip(prev => {
      const days = prev.itinerary.days.map((d, dIdx) => {
        if (dIdx !== dayIndex) return d;
        const newActs = [...d.activities, newActivity];
        const actsCost = newActs.reduce((s, a) => s + a.cost, 0);
        return {
          ...d,
          activities: newActs,
          dailyTotal: actsCost + d.accommodationCost
        };
      });

      const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          days,
          grandTotal,
          remainingBudget: prev.totalBudget - grandTotal
        }
      };
    });

    const ownerMember = trip.members.find(m => m.role === 'owner') || trip.members[0];
    const userObj: User = {
      id: trip.userId,
      name: ownerMember?.name || 'Explorer',
      email: ownerMember?.email || 'traveler@voyage.ai'
    };
    notificationService.sendItineraryUpdateDebounced(userObj, trip, `Added "${newActivity.name}" to Day ${dayIndex + 1}`);

    // Reset
    setNewActName('');
    setNewActDesc('');
    setNewActCost(0);
    setNewActLocation('');
    setShowAddActivityModal(null);
  };

  // AI Regenerate Day (simulate relaxing pace or optimizing costs)
  const handleRegenerateDay = (dayIndex: number, mode: 'cheaper' | 'relax') => {
    onUpdateTrip(prev => {
      const days = [...prev.itinerary.days];
      const targetDay = { ...days[dayIndex] };

      if (mode === 'relax' && targetDay.activities.length > 2) {
        // Keep 2 best activities
        targetDay.activities = targetDay.activities.slice(0, 2);
        targetDay.title = `Relaxed Pace Day ${targetDay.day}`;
      } else if (mode === 'cheaper') {
        // Discount high cost items
        targetDay.activities = targetDay.activities.map(a => ({
          ...a,
          cost: Math.round(a.cost * 0.5)
        }));
        targetDay.title = `Budget-Optimized Day ${targetDay.day}`;
      }

      const actsCost = targetDay.activities.reduce((s, a) => s + a.cost, 0);
      targetDay.dailyTotal = actsCost + targetDay.accommodationCost;
      days[dayIndex] = targetDay;

      const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);
      return {
        ...prev,
        itinerary: {
          ...prev.itinerary,
          days,
          grandTotal,
          remainingBudget: prev.totalBudget - grandTotal
        }
      };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Controls: View Switcher & Day Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-space-border">
        {/* Day selection tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {trip.itinerary.days.map((day) => (
            <button
              key={day.day}
              onClick={() => setActiveDayNumber(day.day)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                activeDayNumber === day.day
                  ? 'bg-brand-primary text-space-main border-brand-primary shadow-md scale-105'
                  : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-1 bg-space-secondary p-1 rounded-xl border border-space-border self-start sm:self-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'timeline' ? 'bg-space-card text-brand-primary shadow-sm' : 'text-typo-muted hover:text-typo-primary'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list' ? 'bg-space-card text-brand-primary shadow-sm' : 'text-typo-muted hover:text-typo-primary'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'calendar' ? 'bg-space-card text-brand-primary shadow-sm' : 'text-typo-muted hover:text-typo-primary'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Days Rendering */}
      {trip.itinerary.days
        .filter(d => viewMode === 'calendar' ? true : d.day === activeDayNumber)
        .map((dayPlan, dIdx) => {
          const actualDayIndex = trip.itinerary.days.findIndex(d => d.day === dayPlan.day);
          
          return (
            <div key={dayPlan.day} className="bg-space-card rounded-[2.5rem] border border-space-border shadow-xl p-8 sm:p-10 space-y-8">
              
              {/* Day Header & AI quick regenerators */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-brand-primary text-space-main font-black text-lg flex items-center justify-center shadow-md">
                      {dayPlan.day}
                    </span>
                    <h3 className="text-2xl font-black text-typo-primary tracking-tight">
                      {dayPlan.title || `Day ${dayPlan.day} Itinerary`}
                    </h3>
                  </div>
                  <p className="text-xs font-bold text-typo-secondary pl-13">
                    {dayPlan.activities.length} experiences • Total: ₹{dayPlan.dailyTotal.toLocaleString()}
                  </p>
                </div>

                {/* Day AI Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRegenerateDay(actualDayIndex, 'relax')}
                    className="px-3.5 py-1.5 rounded-xl bg-space-secondary hover:bg-space-border text-typo-secondary hover:text-typo-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Make this day less packed"
                  >
                    <Sparkles size={13} className="text-brand-glow" /> Make Less Hectic
                  </button>
                  <button
                    onClick={() => handleRegenerateDay(actualDayIndex, 'cheaper')}
                    className="px-3.5 py-1.5 rounded-xl bg-space-secondary hover:bg-space-border text-typo-secondary hover:text-typo-primary text-xs font-bold transition-colors flex items-center gap-1.5"
                    title="Optimize costs for this day"
                  >
                    <Sparkles size={13} className="text-brand-primary" /> Make Cheaper
                  </button>
                  <button
                    onClick={() => setShowAddActivityModal(actualDayIndex)}
                    className="px-4 py-1.5 rounded-xl bg-brand-primary text-space-main text-xs font-bold hover:bg-brand-glow transition-all flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Place
                  </button>
                </div>
              </div>

              {/* Stay Banner for Day */}
              {dayPlan.accommodationCost > 0 && (
                <div className="bg-space-secondary/70 rounded-2xl p-5 border border-space-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-glow/10 border border-brand-glow/30 flex items-center justify-center text-brand-glow">
                      <Bed size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-typo-muted">Curated Night Stay</p>
                      <h4 className="font-bold text-sm text-typo-primary">Accommodation Reserved</h4>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-primary">
                    ₹{dayPlan.accommodationCost.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Activities List */}
              <div className="space-y-4">
                {dayPlan.activities.map((activity, actIdx) => (
                  <div
                    key={activity.id}
                    className="bg-space-secondary/40 hover:bg-space-secondary/80 rounded-2xl p-5 border border-space-border/60 hover:border-brand-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Timing & Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-brand-primary text-space-main text-[10px] font-black uppercase tracking-wider">
                          {activity.timeSlot}
                        </span>
                        <h4 
                          onClick={() => onSelectActivity(activity)}
                          className="font-black text-lg text-typo-primary hover:text-brand-glow cursor-pointer transition-colors"
                        >
                          {activity.name}
                        </h4>
                        <span className="text-[10px] font-bold text-brand-glow px-2 py-0.5 rounded bg-brand-glow/10 border border-brand-glow/20">
                          {activity.activityType}
                        </span>
                      </div>
                      <p className="text-xs text-typo-secondary font-medium leading-relaxed max-w-2xl">
                        {activity.description}
                      </p>
                      <p className="text-[11px] font-semibold text-typo-muted flex items-center gap-1.5 pt-0.5">
                        <MapPin size={13} className="text-brand-glow" /> {activity.location}
                        {activity.estimatedDuration && <span>• ⏱ {activity.estimatedDuration}</span>}
                      </p>
                    </div>

                    {/* Right: Cost & Reorder Controls */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <span className="text-sm font-black text-brand-primary">
                        {activity.cost === 0 ? 'Complimentary' : `₹${activity.cost.toLocaleString()}`}
                      </span>

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 border border-space-border rounded-xl p-1 bg-space-card">
                        <button
                          onClick={() => moveActivity(actualDayIndex, actIdx, 'up')}
                          disabled={actIdx === 0}
                          className="p-1 rounded text-typo-muted hover:text-typo-primary disabled:opacity-20"
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveActivity(actualDayIndex, actIdx, 'down')}
                          disabled={actIdx === dayPlan.activities.length - 1}
                          className="p-1 rounded text-typo-muted hover:text-typo-primary disabled:opacity-20"
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteActivity(actualDayIndex, activity.id)}
                        className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Remove activity"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Activity Inline Modal */}
              {showAddActivityModal === actualDayIndex && (
                <div className="p-6 bg-space-secondary rounded-3xl border-2 border-brand-primary/40 space-y-4 animate-in fade-in">
                  <h4 className="font-extrabold text-sm text-typo-primary">Add Place to Day {dayPlan.day}</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input 
                      type="text"
                      placeholder="Activity or Place name *"
                      value={newActName}
                      onChange={(e) => setNewActName(e.target.value)}
                      className="bg-space-card border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                    />
                    <input 
                      type="text"
                      placeholder="Location address / district"
                      value={newActLocation}
                      onChange={(e) => setNewActLocation(e.target.value)}
                      className="bg-space-card border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                    />
                    <select
                      value={newActSlot}
                      onChange={(e) => setNewActSlot(e.target.value as any)}
                      className="bg-space-card border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                    <input 
                      type="number"
                      placeholder="Estimated Cost (₹)"
                      value={newActCost || ''}
                      onChange={(e) => setNewActCost(Number(e.target.value))}
                      className="bg-space-card border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                    />
                  </div>
                  <input 
                    type="text"
                    placeholder="Short description or notes"
                    value={newActDesc}
                    onChange={(e) => setNewActDesc(e.target.value)}
                    className="w-full bg-space-card border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddActivityModal(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-typo-secondary hover:text-typo-primary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddActivity(actualDayIndex)}
                      className="px-5 py-2 rounded-xl bg-brand-primary text-space-main text-xs font-bold"
                    >
                      Save Activity
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}

    </div>
  );
};
