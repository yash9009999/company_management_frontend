import { useEffect, useState } from 'react';
import axios from 'axios';

interface UserOption {
  id: number;
  name: string;
}

interface Work {
  id: number;
  workCode: string;
  marketingPersonId: number;
  marketingPerson: { id: number; name: string };
  wordCount: number;
  priceInRs: number;
  categoryType: 'STUDENT' | 'VENDOR' | 'OTHER';
  clientName: string;
  clientPhone: string;
  otherDescription?: string | null;
  deadline: string;
  status: 'PENDING' | 'DONE' | 'HAS_QUERY' | 'CANCELLED';
  createdAt: string;
  marketingCancelReason?: string | null;
  writerQuery?: string | null;
}

export const AdminWorks = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [marketingFilter, setMarketingFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [users, setUsers] = useState<UserOption[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Work | null>(null);
  const [form, setForm] = useState<Partial<Work>>({});

  const fetchUsers = async () => {
    const res = await axios.get('/api/users?page=1&pageSize=100');
    const marketing = (res.data.users as any[]).filter((u) => u.role === 'MARKETING');
    setUsers(marketing.map((u) => ({ id: u.id, name: u.name })));
  };

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (marketingFilter) params.marketingPersonId = marketingFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await axios.get('/api/works', { params });
      setWorks(res.data);
      setLoading(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load works');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [statusFilter, marketingFilter, fromDate, toDate]);

  const openEdit = (w: Work) => {
    setEditing(w);
    setForm({ ...w });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await axios.put(`/api/works/${editing.id}`, {
        wordCount: form.wordCount,
        priceInRs: form.priceInRs,
        categoryType: form.categoryType,
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        otherDescription: form.categoryType === 'OTHER' ? form.otherDescription : undefined,
        deadline: form.deadline,
        status: form.status,
        marketingPersonId: form.marketingPersonId,
      });
      setShowModal(false);
      fetchWorks();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  const deleteWork = async (w: Work) => {
    if (!confirm(`Delete work ${w.workCode}?`)) return;
    await axios.delete(`/api/works/${w.id}`);
    fetchWorks();
  };

  if (loading) return <div>Loading works...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Works</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="DONE">DONE</option>
          <option value="HAS_QUERY">HAS_QUERY</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={marketingFilter}
          onChange={(e) => setMarketingFilter(e.target.value)}
        >
          <option value="">All Marketing</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

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
              <th className="px-2 py-2 text-right">Actions</th>
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
                <td className="px-2 py-2 text-right space-x-1">
                  <button
                    onClick={() => openEdit(w)}
                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteWork(w)}
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow max-w-lg w-full p-4 mx-2 max-h-[90vh] overflow-auto text-sm">
            <h2 className="text-md font-semibold mb-3">Edit Work {editing.workCode}</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs mb-1">Word Count</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={form.wordCount ?? ''}
                  onChange={(e) => setForm({ ...form, wordCount: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Price (₹)</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={form.priceInRs ?? ''}
                  onChange={(e) => setForm({ ...form, priceInRs: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Category</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form.categoryType}
                  onChange={(e) =>
                    setForm({ ...form, categoryType: e.target.value as Work['categoryType'] })
                  }
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="VENDOR">VENDOR</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Client Name</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={form.clientName ?? ''}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Client Phone</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={form.clientPhone ?? ''}
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  required
                />
              </div>
              {form.categoryType === 'OTHER' && (
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Other Description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1"
                    value={form.otherDescription ?? ''}
                    onChange={(e) => setForm({ ...form, otherDescription: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label className="block text-xs mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-2 py-1"
                  value={form.deadline ? form.deadline.substring(0, 16) : ''}
                  onChange={(e) => setForm({ ...form, deadline: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Status</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Work['status'] })}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DONE">DONE</option>
                  <option value="HAS_QUERY">HAS_QUERY</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Marketing Person</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={form.marketingPersonId}
                  onChange={(e) =>
                    setForm({ ...form, marketingPersonId: Number(e.target.value) })
                  }
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 text-xs rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs rounded bg-indigo-600 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
