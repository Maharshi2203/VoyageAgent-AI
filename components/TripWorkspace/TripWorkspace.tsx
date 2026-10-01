import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Share2, 
  Download, 
  Bot, 
  Layers, 
  Compass, 
  Bed, 
  Plane, 
  Wallet, 
  Luggage, 
  FileText, 
  BookOpen, 
  Users,
  Film
} from 'lucide-react';
import { Trip, Activity } from '../../types';
import { TripOverviewTab } from './TripOverviewTab';
import { TripItineraryTab } from './TripItineraryTab';
import { TripMapTab } from './TripMapTab';
import { TripBookingsTab } from './TripBookingsTab';
import { TripStaysTab } from './TripStaysTab';
import { TripTransportTab } from './TripTransportTab';
import { TripBudgetTab } from './TripBudgetTab';
import { TripPackingTab } from './TripPackingTab';
import { TripDocumentsTab } from './TripDocumentsTab';
import { TripJournalTab } from './TripJournalTab';
import { TripCollaborationTab } from './TripCollaborationTab';
import { TripReelModal } from './TripReelModal';
import { TripAIAssistantDrawer } from './TripAIAssistantDrawer';
import ActivityDetailPanel from '../ActivityDetailPenal';

interface TripWorkspaceProps {
  trip: Trip;
  onBackToDashboard: () => void;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripWorkspace: React.FC<TripWorkspaceProps> = ({
  trip,
  onBackToDashboard,
  onUpdateTrip
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isReelOpen, setIsReelOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Layers size={15} /> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={15} /> },
    { id: 'map', label: 'Map', icon: <Compass size={15} /> },
    { id: 'bookings', label: 'Bookings', icon: <FileText size={15} /> },
    { id: 'stays', label: 'Stays', icon: <Bed size={15} /> },
    { id: 'transport', label: 'Transport', icon: <Plane size={15} /> },
    { id: 'budget', label: 'Budget', icon: <Wallet size={15} /> },
    { id: 'packing', label: 'Packing', icon: <Luggage size={15} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={15} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={15} /> },
    { id: 'people', label: 'People', icon: <Users size={15} /> }
  ];

  const handleExportManifest = () => {
    let text = `VOYAGEAGENT TRIP MANIFEST\n================================\n\n`;
    text += `Trip: ${trip.title}\nDestination: ${trip.destination}\nDuration: ${trip.duration} Days\nBudget: ₹${trip.totalBudget.toLocaleString()}\nEst. Spent: ₹${trip.itinerary.grandTotal.toLocaleString()}\n\n`;
    trip.itinerary.days.forEach(day => {
      text += `DAY ${day.day}\n----------------\nStay: ₹${day.accommodationCost.toLocaleString()}\n`;
      day.activities.forEach(a => text += `[${a.timeSlot}] ${a.name} (₹${a.cost.toLocaleString()}) - ${a.location}\n`);
      text += `Day Total: ₹${day.dailyTotal.toLocaleString()}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.title.replace(/\s+/g, '_')}_Manifest.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen pb-20">
      
      {/* Sticky Workspace Sub-Header Bar */}
      <div className="sticky top-20 z-40 bg-space-main/90 backdrop-blur-xl border-b border-space-border/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-space-border/40">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-xl bg-space-secondary hover:bg-space-card text-typo-secondary hover:text-typo-primary border border-space-border transition-colors"
                title="Return to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-typo-primary tracking-tight leading-none">
                    {trip.title}
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-brand-glow animate-pulse" />
                </div>
                <p className="text-[11px] font-semibold text-typo-secondary mt-0.5">
                  {trip.destination} • {trip.duration} Days • {trip.startDate}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsReelOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-space-card hover:bg-space-secondary border border-space-border text-xs font-bold text-typo-primary flex items-center gap-1.5 transition-colors"
              >
                <Film size={14} className="text-brand-glow" />
                <span>Reel</span>
              </button>

              <button
                onClick={handleExportManifest}
                className="px-3.5 py-1.5 rounded-xl bg-space-card hover:bg-space-secondary border border-space-border text-xs font-bold text-typo-primary flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>Manifest</span>
              </button>

              <button
                onClick={() => setIsCopilotOpen(true)}
                className="px-4 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-glow text-space-main text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
              >
                <Bot size={14} />
                <span>Copilot</span>
              </button>
            </div>
          </div>

          {/* Connected Tabs Navigation Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2.5 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-brand-primary text-space-main border-brand-primary shadow-sm'
                    : 'bg-space-secondary/50 border-transparent text-typo-secondary hover:text-typo-primary hover:bg-space-secondary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Tab View Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <TripOverviewTab 
            trip={trip}
            onNavigateTab={setActiveTab}
            onSelectActivity={setSelectedActivity}
            onOpenReel={() => setIsReelOpen(true)}
            onExportManifest={handleExportManifest}
          />
        )}

        {activeTab === 'itinerary' && (
          <TripItineraryTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
            onSelectActivity={setSelectedActivity}
          />
        )}

        {activeTab === 'map' && (
          <TripMapTab 
            trip={trip}
            onSelectActivity={setSelectedActivity}
          />
        )}

        {activeTab === 'bookings' && (
          <TripBookingsTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'stays' && (
          <TripStaysTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'transport' && (
          <TripTransportTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'budget' && (
          <TripBudgetTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'packing' && (
          <TripPackingTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'documents' && (
          <TripDocumentsTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}

        {activeTab === 'journal' && (
          <TripJournalTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
            onOpenReel={() => setIsReelOpen(true)}
          />
        )}

        {activeTab === 'people' && (
          <TripCollaborationTab 
            trip={trip}
            onUpdateTrip={onUpdateTrip}
          />
        )}
      </main>

      {/* Floating Copilot Button */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-brand-primary hover:bg-brand-glow text-space-main shadow-2xl shadow-brand-primary/40 flex items-center gap-2.5 font-black text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95"
      >
        <Bot size={20} />
        <span className="hidden sm:inline">Trip Copilot</span>
      </button>

      {/* Slide-out Copilot Drawer */}
      <TripAIAssistantDrawer 
        trip={trip}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onUpdateTrip={onUpdateTrip}
      />

      {/* Activity Detail Panel */}
      <ActivityDetailPanel 
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        currency={trip.currency}
      />

      {/* Fullscreen Vertical Trip Reel Story */}
      <TripReelModal 
        trip={trip}
        isOpen={isReelOpen}
        onClose={() => setIsReelOpen(false)}
      />

    </div>
  );
};
