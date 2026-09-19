import React from 'react';
import { useAppContext } from '../../store/AppContext';
import { Check, X, Trash2, Star, RotateCcw } from 'lucide-react';

// [UI COMPONENT] ReviewsManager - Renders the ReviewsManager view
export default function ReviewsManager() {
  const { reviews, updateReview, deleteReview } = useAppContext();

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    const review = reviews.find(r => r.id === id);
    if (review) {
      await updateReview({ ...review, status });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Permanently delete this review? This action cannot be undone.')) {
      await deleteReview(id);
    }
  };

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const rejectedReviews = reviews.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3E3A35]">Reviews Moderation</h1>
        <p className="text-xs text-[#7A7369] mt-0.5">Approve, reject, or permanently delete customer reviews</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-[#7A7369] mb-4 uppercase tracking-wider">
            Pending Moderation ({pendingReviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviews.map(review => (
              <div key={review.id} className="bg-[#FCFBF8] border border-amber-500/30 rounded-xl p-5 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#E2B87C] text-[#E2B87C]' : 'fill-[#CACACB]/20 text-transparent'}`} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(review.id, 'approved')} title="Approve" className="p-1.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-md transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleStatus(review.id, 'rejected')} title="Reject" className="p-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(review.id)} title="Delete" className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-[#3E3A35] text-sm mb-3">"{review.comment}"</p>
                <div className="text-xs text-[#7A7369]/60">
                  {review.name} • {review.country || 'Global'} • {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
            ))}
            {pendingReviews.length === 0 && (
              <div className="col-span-full p-8 text-center text-[#7A7369]/50 bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl text-sm">
                No pending reviews.
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-[#7A7369] mb-4 uppercase tracking-wider">
            Published Reviews ({approvedReviews.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedReviews.map(review => (
              <div key={review.id} className="bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl p-5 relative group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#E2B87C] text-[#E2B87C]' : 'fill-[#CACACB]/20 text-transparent'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleStatus(review.id, 'rejected')} title="Unpublish (Reject)" className="p-1 text-amber-600 hover:bg-amber-50 rounded"><X className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(review.id)} title="Permanently Delete" className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-[#3E3A35] text-sm mb-3 line-clamp-3">"{review.comment}"</p>
                <div className="text-xs text-[#7A7369]/60">
                  {review.name} • {review.country || 'Global'}
                </div>
              </div>
            ))}
            {approvedReviews.length === 0 && (
              <div className="col-span-full p-8 text-center text-[#7A7369]/50 bg-[#FCFBF8] border border-[#E6DFD5] rounded-xl text-sm">
                No published reviews.
              </div>
            )}
          </div>
        </div>

        {rejectedReviews.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-[#7A7369] mb-4 uppercase tracking-wider">
              Rejected Reviews ({rejectedReviews.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedReviews.map(review => (
                <div key={review.id} className="bg-[#FCFBF8] border border-red-200/50 rounded-xl p-5 relative opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#E2B87C] text-[#E2B87C]' : 'fill-[#CACACB]/20 text-transparent'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleStatus(review.id, 'approved')} title="Restore / Approve" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><RotateCcw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(review.id)} title="Permanently Delete" className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-[#7A7369] text-sm mb-3 line-clamp-3">"{review.comment}"</p>
                  <div className="text-xs text-[#7A7369]/60">
                    {review.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
