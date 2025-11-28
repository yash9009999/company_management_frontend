import { useEffect, useState } from 'react';
import axios from 'axios';

interface Work {
  id: number;
  workCode: string;
  marketingPerson: { id: number; name: string };
  categoryType: 'STUDENT' | 'VENDOR' | 'OTHER';
  clientName: string;
  clientPhone: string;
  priceInRs: number;
  wordCount: number;
  deadline: string;
  status: 'PENDING' | 'DONE' | 'HAS_QUERY' | 'CANCELLED';
  createdAt: string;
  marketingCancelReason?: string | null;
  writerQuery?: string | null;
}

export const WriterDashboard = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get('/api/works', { params });
      setWorks(res.data);
      setLoading(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load works');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [statusFilter]);

  const updateStatus = async (w: Work, status: Work['status']) => {
    try {
      let writerQuery: string | undefined;
      if (status === 'HAS_QUERY') {
        const q = window.prompt(`Enter query for work ${w.workCode}:`);
        if (!q) return;
        writerQuery = q;
      }

      await axios.put(`/api/works/${w.id}`, { status, writerQuery });
      setWorks((prev) =>
        prev.map((x) =>
          x.id === w.id
            ? { ...x, status, writerQuery: status === 'HAS_QUERY' ? writerQuery : null }
            : x,
        ),
      );
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div>Loading works...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">All Works</h1>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="DONE">DONE</option>
          <option value="HAS_QUERY">HAS_QUERY</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left">Code</th>
              <th className="px-2 py-2 text-left">Marketing</th>
              <th className="px-2 py-2 text-left">Category</th>
              <th className="px-2 py-2 text-left">Client</th>
              <th className="px-2 py-2 text-left">Phone</th>
              <th className="px-2 py-2 text-left">Price</th>
              <th className="px-2 py-2 text-left">Words</th>
              <th className="px-2 py-2 text-left">Deadline</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Created</th>
              <th className="px-2 py-2 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-2 py-2 whitespace-nowrap">{w.workCode}</td>
                <td className="px-2 py-2 whitespace-nowrap">{w.marketingPerson?.name}</td>
                <td className="px-2 py-2">{w.categoryType}</td>
                <td className="px-2 py-2">{w.clientName}</td>
                <td className="px-2 py-2 break-all">{w.clientPhone}</td>
                <td className="px-2 py-2">₹{w.priceInRs}</td>
                <td className="px-2 py-2">{w.wordCount}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(w.deadline).toLocaleString()}
                </td>
                <td className="px-2 py-2">
                  <select
                    className="border rounded px-1 py-0.5 text-xs"
                    value={w.status}
                    onChange={(e) => updateStatus(w, e.target.value as Work['status'])}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="DONE">DONE</option>
                    <option value="HAS_QUERY">HAS_QUERY</option>
                  </select>
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {new Date(w.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-2 text-xs">
                  {w.marketingCancelReason && (
                    <div className="text-red-600">Cancelled: {w.marketingCancelReason}</div>
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
