import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  Vote, 
  Share2,
  Copy,
  Mail
} from 'lucide-react';
import { Trip, TripMember, TripPoll, ActivityVoteOption } from '../../types';

interface TripCollaborationTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripCollaborationTab: React.FC<TripCollaborationTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<TripMember['role']>('editor');
  const [copiedLink, setCopiedLink] = useState(false);

  // Poll creation
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollDay, setPollDay] = useState(1);
  const [pollQuestion, setPollQuestion] = useState('');
  const [opt1Name, setOpt1Name] = useState('');
  const [opt2Name, setOpt2Name] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TripMember = {
      id: `usr_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole
    };

    onUpdateTrip(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setInviteName('');
    setInviteEmail('');
  };

  const handleVote = (pollId: string, optionId: string) => {
    const voterName = trip.members[0]?.name || 'You';

    onUpdateTrip(prev => ({
      ...prev,
      polls: prev.polls.map(poll => {
        if (poll.id !== pollId) return poll;
        return {
          ...poll,
          options: poll.options.map(opt => {
            if (opt.id === optionId) {
              const alreadyVoted = opt.votes.includes(voterName);
              return {
                ...opt,
                votes: alreadyVoted 
                  ? opt.votes.filter(v => v !== voterName) 
                  : [...opt.votes, voterName]
              };
            }
            return opt;
          })
        };
      })
    }));
  };

  const handleSelectWinningOption = (pollId: string, optionId: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      polls: prev.polls.map(poll => 
        poll.id === pollId ? { ...poll, isClosed: true, selectedOptionId: optionId } : poll
      )
    }));
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !opt1Name.trim() || !opt2Name.trim()) return;

    const newPoll: TripPoll = {
      id: `poll_${Date.now()}`,
      tripId: trip.id,
      day: pollDay,
      question: pollQuestion.trim(),
      isClosed: false,
      options: [
        {
          id: `opt_${Date.now()}_1`,
          name: opt1Name.trim(),
          description: 'Group suggested activity',
          location: trip.destination,
          cost: 0,
          votes: []
        },
        {
          id: `opt_${Date.now()}_2`,
          name: opt2Name.trim(),
          description: 'Alternative group suggested activity',
          location: trip.destination,
          cost: 0,
          votes: []
        }
      ]
    };

    onUpdateTrip(prev => ({
      ...prev,
      polls: [...prev.polls, newPoll]
    }));

    setPollQuestion('');
    setOpt1Name('');
    setOpt2Name('');
    setShowCreatePoll(false);
  };

  const copyTripLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Companions & Decision Voting</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Coordinate with your travel crew, assign roles, suggest alternative activities, and vote on what to do.
          </p>
        </div>

        <button
          onClick={copyTripLink}
          className="px-5 py-2.5 rounded-2xl bg-space-card hover:bg-space-secondary border border-space-border text-xs font-bold text-typo-primary flex items-center gap-2 transition-colors"
        >
          <Share2 size={15} className="text-brand-glow" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Trip Link'}</span>
        </button>
      </div>

      {/* Grid: Members Column & Voting Polls Column */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Travel Companions */}
        <div className="lg:col-span-5 bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-space-border">
            <h3 className="text-xl font-black text-typo-primary tracking-tight flex items-center gap-2">
              <Users size={18} className="text-brand-glow" /> Travel Companions
            </h3>
            <span className="text-xs font-bold text-typo-muted">{trip.members.length} Members</span>
          </div>

          <div className="space-y-3">
            {trip.members.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-space-secondary/60 rounded-2xl border border-space-border/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-glow text-space-main font-black text-xs flex items-center justify-center">
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-typo-primary leading-tight">{member.name}</h4>
                    <p className="text-[11px] text-typo-muted font-medium">{member.email}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                  member.role === 'owner' 
                    ? 'bg-brand-primary text-space-main border-brand-primary' 
                    : 'bg-space-card text-brand-glow border-space-border'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="pt-4 border-t border-space-border space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-primary block">
              Invite Companion
            </span>
            <div className="grid sm:grid-cols-2 gap-2">
              <input 
                type="text"
                required
                placeholder="Name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="bg-space-secondary border border-space-border rounded-xl px-3 py-2 text-xs font-bold text-typo-primary outline-none"
              />
              <input 
                type="email"
                required
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-space-secondary border border-space-border rounded-xl px-3 py-2 text-xs font-bold text-typo-primary outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="bg-space-secondary border border-space-border rounded-xl px-3 py-2 text-xs font-bold text-typo-primary outline-none cursor-pointer"
              >
                <option value="editor">Role: Editor</option>
                <option value="viewer">Role: Viewer</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-primary text-space-main font-bold text-xs shadow-md hover:bg-brand-glow transition-all"
              >
                Send Invite
              </button>
            </div>
          </form>
        </div>

        {/* Right: Activity Voting Polls */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-typo-primary tracking-tight flex items-center gap-2">
              <Vote size={18} className="text-brand-glow" /> Activity Decision Polls
            </h3>
            <button
              onClick={() => setShowCreatePoll(true)}
              className="px-4 py-2 rounded-xl bg-brand-primary text-space-main text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-brand-glow transition-all"
            >
              <Plus size={14} /> New Poll
            </button>
          </div>

          {trip.polls.length === 0 ? (
            <div className="bg-space-card rounded-[2.5rem] p-12 text-center border-2 border-dashed border-space-border space-y-3">
              <Vote size={40} className="mx-auto text-typo-muted" />
              <h4 className="font-bold text-base text-typo-primary">No group polls yet.</h4>
              <p className="text-xs text-typo-secondary max-w-sm mx-auto">
                Create an activity vote to let companions decide between beach clubs, hikes, or museum visits.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {trip.polls.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      Day {poll.day} Options
                    </span>
                    {poll.isClosed ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Decision Finalized
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-brand-glow animate-pulse">
                        Voting Active
                      </span>
                    )}
                  </div>

                  <h4 className="text-xl font-black text-typo-primary tracking-tight leading-tight">
                    {poll.question}
                  </h4>

                  <div className="space-y-3">
                    {poll.options.map((opt) => {
                      const isWinner = poll.selectedOptionId === opt.id;
                      const hasVoted = opt.votes.includes(trip.members[0]?.name || 'You');

                      return (
                        <div
                          key={opt.id}
                          className={`p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isWinner
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-typo-primary'
                              : 'bg-space-secondary/60 hover:bg-space-secondary border-space-border/60'
                          }`}
                        >
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-sm text-typo-primary">{opt.name}</h5>
                            <p className="text-xs text-typo-muted">{opt.description}</p>
                            {opt.votes.length > 0 && (
                              <p className="text-[10px] text-brand-glow font-semibold pt-1">
                                Voted by: {opt.votes.join(', ')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleVote(poll.id, opt.id)}
                              disabled={poll.isClosed}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                                hasVoted
                                  ? 'bg-red-500 text-white border-red-500'
                                  : 'bg-space-card text-typo-secondary hover:text-red-400 border-space-border'
                              }`}
                            >
                              <Heart size={14} className={hasVoted ? 'fill-white' : ''} />
                              <span>{opt.votes.length}</span>
                            </button>

                            {!poll.isClosed && (
                              <button
                                onClick={() => handleSelectWinningOption(poll.id, opt.id)}
                                className="px-3 py-1.5 rounded-xl bg-space-card hover:bg-brand-primary hover:text-space-main border border-space-border text-xs font-bold transition-colors"
                              >
                                Select Final
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form
            onSubmit={handleCreatePoll}
            className="w-full max-w-lg bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-5"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Create Decision Poll</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Day of Itinerary</label>
              <select
                value={pollDay}
                onChange={(e) => setPollDay(Number(e.target.value))}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
              >
                {trip.itinerary.days.map(d => (
                  <option key={d.day} value={d.day}>Day {d.day}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Question *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Which afternoon experience should we do?"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Option 1 *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Surfing lesson at sunset"
                value={opt1Name}
                onChange={(e) => setOpt1Name(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Option 2 *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Coastal cliff hike & viewpoint"
                value={opt2Name}
                onChange={(e) => setOpt2Name(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreatePoll(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-typo-secondary hover:text-typo-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-space-main text-xs font-bold shadow-md hover:bg-brand-glow transition-all"
              >
                Launch Poll
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
