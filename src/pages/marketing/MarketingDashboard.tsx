import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Work {
  id: number;
  workCode: string;
  clientName: string;
  categoryType: 'STUDENT' | 'VENDOR' | 'OTHER';
  priceInRs: number;
  deadline: string;
  status: 'PENDING' | 'DONE' | 'HAS_QUERY' | 'CANCELLED';
  createdAt: string;
  marketingCancelReason?: string | null;
  writerQuery?: string | null;
}

export const MarketingDashboard = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cancelWork = async (work: Work) => {
    const reason = window.prompt(`Cancel work ${work.workCode}. Enter reason:`);
    if (!reason) return;
    try {
      await axios.post(`/api/works/${work.id}/cancel`, { reason });
      await fetchWorks();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to cancel work');
    }
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/works');
      setWorks(res.data);
      setLoading(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load works');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  if (loading) return <div>Loading works...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">My Works</h1>
        <Link
          to="/marketing/work/new"
          className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          Create New Work
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Code</th>
              <th className="px-2 py-2 text-left">Client</th>
              <th className="px-2 py-2 text-left">Category</th>
              <th className="px-2 py-2 text-left">Price</th>
              <th className="px-2 py-2 text-left">Deadline</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Created</th>
              <th className="px-2 py-2 text-left">Notes</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-2 py-2 whitespace-nowrap">{w.workCode}</td>
                <td className="px-2 py-2">{w.clientName}</td>
                <td className="px-2 py-2">{w.categoryType}</td>
                <td className="px-2 py-2">₹{w.priceInRs}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(w.deadline).toLocaleString()}
                </td>
                <td className="px-2 py-2">{w.status}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(w.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-2 text-xs">
                  {w.marketingCancelReason && (
                    <div className="text-red-600">Cancelled: {w.marketingCancelReason}</div>
                  )}
                  {w.writerQuery && (
                    <div className="text-indigo-700 mt-1">Writer query: {w.writerQuery}</div>
                  )}
                </td>
                <td className="px-2 py-2 text-right">
                  {w.status !== 'CANCELLED' && (
                    <button
                      onClick={() => cancelWork(w)}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
