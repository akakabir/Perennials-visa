import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { Button } from '../../components/Button';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { VisaPlan, Price } from '../../types';

// [UI COMPONENT] PricingManager - Renders the PricingManager view
export default function PricingManager() {
  const { visaPlans, updateVisaPlan } = useAppContext();
  const [selectedPlanId, setSelectedPlanId] = useState<string>(visaPlans[0]?.id || '');

  const selectedPlan = visaPlans.find(p => p.id === selectedPlanId);

  const [prices, setPrices] = useState<Price[]>(selectedPlan?.prices || []);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (selectedPlan) {
      setPrices(selectedPlan.prices);
    }
  }, [selectedPlanId, selectedPlan]);

  const handlePriceChange = (index: number, field: keyof Price, value: string | number) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setPrices(newPrices);
    setSaved(false);
  };

  const addPrice = () => {
    setPrices([...prices, { country: '', currencyCode: 'USD', currencySymbol: '$', amount: 0, note: 'Excludes applicable local taxes/GST/VAT' }]);
    setSaved(false);
  };

  const removePrice = (index: number) => {
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
    setSaved(false);
  };

  const handleSave = () => {
    if (selectedPlan) {
      updateVisaPlan({ ...selectedPlan, prices });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3E3A35] mb-8">Pricing & Currency Manager</h1>

      <div className="flex gap-8">

        <div className="w-1/3 bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-4 h-[calc(100vh-140px)] overflow-y-auto">
          <h2 className="text-sm font-medium text-[#7A7369] mb-4 px-2">Select Plan to Edit Prices</h2>
          <div className="space-y-2">
            {visaPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${selectedPlanId === plan.id ? 'bg-[#FCFBF8] border border-[#E2B87C]/50 text-[#3E3A35]' : 'hover:bg-[#FCFBF8] border border-transparent text-[#7A7369]/70'}`}
              >
                <div className="font-medium text-sm">{plan.name}</div>
                <div className="text-xs mt-1 opacity-60">{plan.prices.length} price variants</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[#FCFBF8] border border-[#E6DFD5] rounded-2xl p-6 relative">
          {selectedPlan ? (
            <>
              <div className="flex justify-between items-center mb-6 border-b border-[#E6DFD5] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#3E3A35] flex items-center gap-2">
                    <span className="text-2xl">{selectedPlan.flag}</span> {selectedPlan.name} Pricing
                  </h2>
                  <p className="text-xs text-[#7A7369]/60 mt-1">Configure localized pricing. Users will select their currency on the public site.</p>
                </div>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" /> {saved ? 'Saved!' : 'Save Pricing'}
                </Button>
              </div>

              <div className="space-y-4">
                {prices.map((price, i) => (
                  <div key={i} className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-4 relative group">
                    <button onClick={() => removePrice(i)} className="absolute top-4 right-4 text-[#7A7369]/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A7369]/60 mb-1">Target Country</label>
                        <input value={price.country} onChange={e => handlePriceChange(i, 'country', e.target.value)} placeholder="e.g. UAE" className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A7369]/60 mb-1">Currency Code</label>
                        <input value={price.currencyCode} onChange={e => handlePriceChange(i, 'currencyCode', e.target.value)} placeholder="AED" className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A7369]/60 mb-1">Symbol</label>
                        <input value={price.currencySymbol} onChange={e => handlePriceChange(i, 'currencySymbol', e.target.value)} placeholder="AED" className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#3E3A35] rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-[#7A7369]/60 mb-1">Amount</label>
                        <input type="number" value={price.amount} onChange={e => handlePriceChange(i, 'amount', Number(e.target.value))} className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#5C564D] font-medium rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#E2B87C]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#7A7369]/60 mb-1">Tax Note</label>
                      <input value={price.note} onChange={e => handlePriceChange(i, 'note', e.target.value)} className="w-full bg-[#FCFBF8] border border-[#E6DFD5] text-[#7A7369]/70 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#E2B87C]" />
                    </div>
                  </div>
                ))}

                <button onClick={addPrice} className="w-full py-3 border border-dashed border-[#D9CFBE] rounded-xl text-[#7A7369] text-sm hover:border-[#E2B87C]/50 hover:text-[#E2B87C] transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Price Variant
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[#7A7369]/50">
              Select a plan from the sidebar to manage pricing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
