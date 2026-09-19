import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { VisaPlan } from '../../types';
import { cn } from '../../lib/utils';

// [UI COMPONENT] PlansManager - Renders the PlansManager view
export default function PlansManager() {
  const { visaPlans, addVisaPlan, updateVisaPlan, deleteVisaPlan } = useAppContext();
  const [editingPlan, setEditingPlan] = useState<VisaPlan | null>(null);
  const [isNew, setIsNew] = useState(false);

  const emptyPlan: VisaPlan = {
    id: '',
    name: '',
    destinationCountry: '',
    flag: '🌍',
    description: '',
    requirements: [''],
    processingTime: '',
    featured: false,
    status: 'active',
    prices: []
  };

  const handleEdit = (plan: VisaPlan) => {
    setEditingPlan({ ...plan });
    setIsNew(false);
  };

  const handleCreate = () => {
    setEditingPlan({ ...emptyPlan, id: Date.now().toString() });
    setIsNew(true);
  };

  const handleSave = () => {
    if (!editingPlan) return;
    if (isNew) {
      addVisaPlan(editingPlan);
    } else {
      updateVisaPlan(editingPlan);
    }
    setEditingPlan(null);
  };

  const handleReqChange = (index: number, value: string) => {
    if (!editingPlan) return;
    const newReqs = [...editingPlan.requirements];
    newReqs[index] = value;
    setEditingPlan({ ...editingPlan, requirements: newReqs });
  };

  const addReq = () => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, requirements: [...editingPlan.requirements, ''] });
  };

  const removeReq = (index: number) => {
    if (!editingPlan) return;
    const newReqs = [...editingPlan.requirements];
    newReqs.splice(index, 1);
    setEditingPlan({ ...editingPlan, requirements: newReqs });
  };

  if (editingPlan) {
    return (
      <div className="max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#3E3A35]">{isNew ? 'Create New Plan' : 'Edit Plan'}</h2>
          <button onClick={() => setEditingPlan(null)} className="text-[#7A7369] hover:text-[#3E3A35]"><X /></button>
        </div>

        <div className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Plan Name</label>
              <input value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Destination Country</label>
              <input value={editingPlan.destinationCountry} onChange={e => setEditingPlan({...editingPlan, destinationCountry: e.target.value})} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Flag Emoji</label>
              <input value={editingPlan.flag} onChange={e => setEditingPlan({...editingPlan, flag: e.target.value})} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7369] mb-1">Processing Time</label>
              <input value={editingPlan.processingTime} onChange={e => setEditingPlan({...editingPlan, processingTime: e.target.value})} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" placeholder="e.g. 2-4 Weeks" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-1">Description</label>
            <textarea value={editingPlan.description} onChange={e => setEditingPlan({...editingPlan, description: e.target.value})} rows={3} className="w-full bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C] resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7369] mb-2">Requirements</label>
            {editingPlan.requirements.map((req, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={req} onChange={e => handleReqChange(i, e.target.value)} className="flex-1 bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E2B87C]" />
                <button onClick={() => removeReq(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={addReq} className="text-xs text-[#E2B87C] hover:underline mt-1">+ Add Requirement</button>
          </div>

          <div className="flex gap-6 pt-4 border-t border-[#E6DFD5]">
            <label className="flex items-center gap-2 text-sm text-[#3E3A35] cursor-pointer">
              <input type="checkbox" checked={editingPlan.featured} onChange={e => setEditingPlan({...editingPlan, featured: e.target.checked})} className="accent-[#E2B87C]" />
              Featured on Homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-[#3E3A35] cursor-pointer">
              <select value={editingPlan.status} onChange={e => setEditingPlan({...editingPlan, status: e.target.value as 'active' | 'archived'})} className="bg-[#FCFBF8] border border-[#D9CFBE] text-[#3E3A35] rounded-lg px-2 py-1 outline-none text-xs">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              Status
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditingPlan(null)}>Cancel</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Save Plan</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#3E3A35]">Visa Plans</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> New Plan</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visaPlans.map(plan => (
          <div key={plan.id} className={cn("bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-5 relative group", plan.status === 'archived' && "opacity-60")}>
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{plan.flag}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(plan)} className="p-1.5 bg-[#FCFBF8] text-[#7A7369] hover:text-[#E2B87C] rounded-lg border border-[#E6DFD5]" title="Edit Plan"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => window.confirm(`Permanently delete "${plan.name}" visa plan? This action cannot be undone.`) && deleteVisaPlan(plan.id)} className="p-1.5 bg-[#FCFBF8] text-[#7A7369] hover:text-red-500 rounded-lg border border-[#E6DFD5]" title="Delete Plan"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[#3E3A35] mb-1">{plan.name}</h3>
            <p className="text-xs text-[#7A7369]/50 mb-3">{plan.destinationCountry}</p>
            <div className="flex gap-2 mt-auto pt-4 border-t border-[#E6DFD5]">
              {plan.featured && <span className="text-[10px] px-2 py-0.5 bg-[#E2B87C]/10 text-[#E2B87C] rounded-full border border-[#E2B87C]/20">Featured</span>}
              <span className="text-[10px] px-2 py-0.5 bg-[#CACACB]/10 text-[#7A7369] rounded-full border border-[#D9CFBE]">{plan.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
