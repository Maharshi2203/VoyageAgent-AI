import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  PieChart as PieIcon, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Trip, ExpenseItem, ExpenseCategory } from '../../types';

interface TripBudgetTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripBudgetTab: React.FC<TripBudgetTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidBy, setPaidBy] = useState(trip.members[0]?.name || 'You');

  const categories: ExpenseCategory[] = [
    'Accommodation',
    'Transport',
    'Food',
    'Activities',
    'Shopping',
    'Visa',
    'Insurance',
    'Miscellaneous'
  ];

  // Calculate category totals
  const categoryTotals = categories.map(cat => {
    const total = trip.expenses
      .filter(e => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    return { name: cat, value: total };
  }).filter(c => c.value > 0);

  const actualSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const plannedSpent = trip.itinerary.grandTotal;
  const remainingTotal = trip.totalBudget - actualSpent;

  // Group balances calculation
  const members = trip.members.map(m => m.name);
  const balances: Record<string, number> = {};
  members.forEach(m => balances[m] = 0);

  trip.expenses.forEach(exp => {
    if (!exp.splitBetween || exp.splitBetween.length === 0) return;
    const splitAmount = exp.amount / exp.splitBetween.length;

    // The person who paid gets credit
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += (exp.amount - splitAmount);
    }

    // Everyone else owes their portion
    exp.splitBetween.forEach(person => {
      if (person !== exp.paidBy && balances[person] !== undefined) {
        balances[person] -= splitAmount;
      }
    });
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp_${Date.now()}`,
      tripId: trip.id,
      amount: Number(amount),
      currency: trip.currency,
      category,
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      paidBy,
      splitBetween: members.length > 0 ? members : [paidBy],
      isSettled: false
    };

    onUpdateTrip(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));

    setAmount(0);
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  const handleSettleBalance = (person: string) => {
    alert(`Marked balance for ${person} as settled.`);
  };

  const COLORS = ['#97A87A', '#B9C99F', '#38BDF8', '#FACC15', '#A78BFA', '#F472B6', '#34D399'];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Financial Hub & Group Split</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Track planned allocations vs real-world transactions, split bills, and settle balances seamlessly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <div className="bg-space-card p-6 rounded-3xl border border-space-border shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted">Total Budget Allocated</span>
          <p className="text-3xl font-black text-typo-primary">₹{trip.totalBudget.toLocaleString()}</p>
          <span className="text-[10px] text-typo-secondary font-bold">Planned Ceiling</span>
        </div>

        <div className="bg-space-card p-6 rounded-3xl border border-space-border shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted">Actual Spent Logged</span>
          <p className="text-3xl font-black text-brand-primary">₹{actualSpent.toLocaleString()}</p>
          <span className="text-[10px] text-typo-secondary font-bold">{trip.expenses.length} transactions recorded</span>
        </div>

        <div className="bg-space-card p-6 rounded-3xl border border-space-border shadow-lg space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted">Remaining Reserve</span>
          <p className={`text-3xl font-black ${remainingTotal >= 0 ? 'text-brand-glow' : 'text-red-400'}`}>
            ₹{Math.abs(remainingTotal).toLocaleString()}
          </p>
          <span className="text-[10px] text-typo-secondary font-bold">
            {remainingTotal >= 0 ? 'Safe runway available' : 'Budget overrun'}
          </span>
        </div>
      </div>

      {/* Group Balances Banner (Splitwise Style) */}
      {members.length > 1 && (
        <div className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-typo-primary tracking-tight flex items-center gap-2">
              <Users size={18} className="text-brand-glow" /> Group Balances & Settlement
            </h3>
            <span className="text-xs font-bold text-typo-muted">Auto-split between {members.length} travelers</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(balances).map(([person, netBalance]) => (
              <div 
                key={person}
                className="bg-space-secondary/70 p-5 rounded-2xl border border-space-border/60 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-typo-primary">{person}</h4>
                  <p className="text-xs font-bold mt-0.5">
                    {netBalance > 0 ? (
                      <span className="text-emerald-400">Gets back ₹{Math.round(netBalance).toLocaleString()}</span>
                    ) : netBalance < 0 ? (
                      <span className="text-amber-400">Owes ₹{Math.round(Math.abs(netBalance)).toLocaleString()}</span>
                    ) : (
                      <span className="text-typo-muted">All settled up</span>
                    )}
                  </p>
                </div>

                {netBalance !== 0 && (
                  <button
                    onClick={() => handleSettleBalance(person)}
                    className="px-3 py-1.5 rounded-xl bg-space-card hover:bg-brand-primary hover:text-space-main text-[11px] font-bold border border-space-border transition-colors"
                  >
                    Settle
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown Chart & Expense Feed */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Category Pie / Bar */}
        <div className="lg:col-span-5 bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-6">
          <h3 className="text-lg font-black text-typo-primary tracking-tight flex items-center gap-2">
            <PieIcon size={18} className="text-brand-glow" /> Category Breakdown
          </h3>

          {categoryTotals.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-typo-muted text-xs">
              Log your expenses to view visual category allocations.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryTotals}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-space-border">
                {categoryTotals.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-typo-secondary font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {cat.name}
                    </span>
                    <span className="font-extrabold text-typo-primary">₹{cat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Expenses Feed */}
        <div className="lg:col-span-7 bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-space-border">
            <h3 className="text-lg font-black text-typo-primary tracking-tight">Recent Transactions</h3>
            <span className="text-xs font-bold text-typo-muted">{trip.expenses.length} Items</span>
          </div>

          {trip.expenses.length === 0 ? (
            <p className="text-xs text-typo-muted text-center py-10">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {trip.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-space-secondary/60 hover:bg-space-secondary rounded-2xl border border-space-border/60 transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary">
                        {exp.category}
                      </span>
                      <h4 className="font-bold text-sm text-typo-primary">{exp.description}</h4>
                    </div>
                    <p className="text-[11px] text-typo-muted font-semibold">
                      Paid by <span className="text-typo-primary">{exp.paidBy}</span> • Split equally
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-brand-primary">
                      ₹{exp.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form 
            onSubmit={handleAddExpense}
            className="w-full max-w-md bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-5"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Record Expense</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Description *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Dinner at Gion Kaiseki"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Amount (₹) *</label>
                <input 
                  type="number"
                  required
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Paid By</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
              >
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
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
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
