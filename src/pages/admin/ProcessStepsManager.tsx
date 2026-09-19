import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { ProcessStep } from '../../types';
import { Plus, Edit2, Trash2, X, Save, Clock } from 'lucide-react';
import { Button } from '../../components/Button';

// [UI COMPONENT] ProcessStepsManager - Renders the ProcessStepsManager view
export default function ProcessStepsManager() {
  const { processSteps, addProcessStep, updateProcessStep, deleteProcessStep } = useAppContext();
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const stepData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      time: formData.get('time') as string,
      order: Number(formData.get('order')) || processSteps.length + 1,
    };

    if (isAdding) {
      await addProcessStep({
        id: Date.now().toString(),
        ...stepData
      });
      setIsAdding(false);
    } else if (editingStep) {
      await updateProcessStep({
        ...editingStep,
        ...stepData
      });
      setEditingStep(null);
    }
  };

  const sortedSteps = [...processSteps].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#3E3A35] mb-2">Process Steps</h2>
          <p className="text-[#7A7369]">Manage the steps shown in the "How It Works" section.</p>
        </div>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Step
        </Button>
      </div>

      {(isAdding || editingStep) && (
        <div className="bg-[#FCFBF8] rounded-2xl p-8 mb-8 border border-[#E6DFD5]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#3E3A35]">
              {isAdding ? 'Add New Step' : 'Edit Step'}
            </h3>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingStep(null);
              }}
              className="text-[#7A7369] hover:text-[#3E3A35]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#7A7369] mb-1">Title</label>
              <input
                name="title"
                defaultValue={editingStep?.title}
                required
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#E2B87C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#7A7369] mb-1">Time Estimate (e.g. "1-2 Days")</label>
              <input
                name="time"
                defaultValue={editingStep?.time}
                required
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#E2B87C]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#7A7369] mb-1">Order</label>
              <input
                name="order"
                type="number"
                defaultValue={editingStep?.order || processSteps.length + 1}
                required
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#E2B87C]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#7A7369] mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={editingStep?.description}
                required
                rows={3}
                className="w-full px-4 py-2 bg-white border border-[#E6DFD5] rounded-xl focus:outline-none focus:border-[#E2B87C]"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingStep(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-5 h-5 mr-2" />
                Save Step
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {sortedSteps.map(step => (
          <div key={step.id} className="bg-[#FCFBF8] p-6 rounded-2xl border border-[#E6DFD5] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="w-8 h-8 rounded-full bg-[#E2B87C] text-white flex items-center justify-center font-bold text-sm">
                  {step.order}
                </span>
                <h3 className="text-xl font-bold text-[#3E3A35]">{step.title}</h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#E6DFD5] text-[#7A7369] text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {step.time}
                </div>
              </div>
              <p className="text-[#7A7369] ml-12">{step.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingStep(step)}
                className="p-2 text-[#7A7369] hover:text-[#E2B87C] hover:bg-white rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.confirm(`Delete step "${step.title}"?`) && deleteProcessStep(step.id)}
                className="p-2 text-[#7A7369] hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                title="Delete Step"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {sortedSteps.length === 0 && (
          <div className="text-center py-12 bg-[#FCFBF8] rounded-2xl border border-[#E6DFD5]">
            <p className="text-[#7A7369]">No process steps found. Add some steps to show in the How It Works section.</p>
          </div>
        )}
      </div>
    </div>
  );
}
