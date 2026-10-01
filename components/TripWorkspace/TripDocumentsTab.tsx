import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Download, 
  Lock, 
  Calendar, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Trip, TravelDocument } from '../../types';

interface TripDocumentsTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripDocumentsTab: React.FC<TripDocumentsTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TravelDocument['type']>('Passport');
  const [fileName, setFileName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDoc: TravelDocument = {
      id: `doc_${Date.now()}`,
      tripId: trip.id,
      title: title.trim(),
      type,
      fileName: fileName.trim() || `${title.replace(/\s+/g, '_')}.pdf`,
      uploadedAt: new Date().toISOString().split('T')[0],
      expiryDate: expiry || undefined,
      notes: notes.trim() || undefined
    };

    onUpdateTrip(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));

    setTitle('');
    setFileName('');
    setExpiry('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <div className="inline-flex items-center gap-2 text-brand-glow text-xs font-black uppercase tracking-[0.25em]">
            <Lock size={13} /> Encrypted Offline Vault
          </div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight mt-1">Travel Document Storage</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Store essential passport scans, visas, travel health insurance, and reservation vouchers safely.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Grid of Documents */}
      {trip.documents.length === 0 ? (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-4">
          <FileText size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">Your document vault is empty.</h3>
          <p className="text-xs text-typo-secondary max-w-sm mx-auto">
            Attach visa approvals, hotel vouchers, and identification copies for quick offline retrieval during transit.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider"
          >
            Add First Document
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trip.documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-space-card rounded-3xl p-6 border border-space-border hover:border-brand-primary/50 shadow-xl transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-space-secondary text-brand-primary border border-space-border">
                    {doc.type}
                  </span>
                  <span className="text-[10px] text-typo-muted font-bold">Uploaded {doc.uploadedAt}</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-glow shrink-0">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-typo-primary leading-tight">{doc.title}</h4>
                    <p className="text-xs text-typo-muted font-semibold mt-0.5 truncate">{doc.fileName}</p>
                  </div>
                </div>

                {doc.expiryDate && (
                  <div className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20 inline-block">
                    Valid until: {doc.expiryDate}
                  </div>
                )}

                {doc.notes && (
                  <p className="text-xs text-typo-secondary bg-space-secondary/50 p-3 rounded-xl italic">
                    "{doc.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-space-border flex items-center justify-between">
                <button
                  onClick={() => alert(`Accessing simulated secure copy of ${doc.fileName}...`)}
                  className="text-xs font-bold text-brand-primary hover:text-brand-glow flex items-center gap-1.5 transition-colors"
                >
                  <Download size={14} /> Download File
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form 
            onSubmit={handleAddDoc}
            className="w-full max-w-md bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-5"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Add Travel Document</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Document Title *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Tourist Visa Confirmation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                >
                  <option value="Passport">Passport</option>
                  <option value="Visa">Visa</option>
                  <option value="Flight Ticket">Flight Ticket</option>
                  <option value="Hotel Voucher">Hotel Voucher</option>
                  <option value="Insurance">Travel Insurance</option>
                  <option value="Driver License">Driver License</option>
                  <option value="Other">Other Voucher</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">File Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Japan_eVisa.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Expiration Date (Optional)</label>
              <input 
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Notes</label>
              <textarea 
                rows={2}
                placeholder="Important reference numbers or emergency contact..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-typo-secondary hover:text-typo-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-space-main text-xs font-bold shadow-md hover:bg-brand-glow transition-all"
              >
                Save Document
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
