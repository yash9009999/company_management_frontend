import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const MarketingNewWork = () => {
  const navigate = useNavigate();
  const [wordCount, setWordCount] = useState('');
  const [priceInRs, setPriceInRs] = useState('');
  const [categoryType, setCategoryType] = useState<'STUDENT' | 'VENDOR' | 'OTHER'>('STUDENT');
  const [otherDescription, setOtherDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post('/api/works', {
        wordCount: Number(wordCount),
        priceInRs: Number(priceInRs),
        categoryType,
        clientName,
        clientPhone,
        otherDescription: categoryType === 'OTHER' ? otherDescription : undefined,
        deadline: new Date(deadline).toISOString(),
      });
      setLoading(false);
      navigate('/marketing/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create work');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-4">
      <h1 className="text-lg font-semibold mb-3">Create New Work</h1>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1">Word Count</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1 text-sm"
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Price (₹)</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1 text-sm"
              value={priceInRs}
              onChange={(e) => setPriceInRs(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1">Category</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value as any)}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="VENDOR">VENDOR</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        {categoryType === 'OTHER' && (
          <div>
            <label className="block text-xs mb-1">Other Description</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm"
              value={otherDescription}
              onChange={(e) => setOtherDescription(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-xs mb-1">Client Name</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Client Phone</label>
          <input
            className="w-full border rounded px-2 py-1 text-sm"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs mb-1">Deadline</label>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1 text-sm"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate('/marketing/dashboard')}
            className="px-3 py-1 text-xs rounded border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 text-xs rounded bg-indigo-600 text-white disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};
