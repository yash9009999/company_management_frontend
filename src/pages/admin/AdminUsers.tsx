import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MARKETING' | 'WRITER';
  isActive: boolean;
  createdAt: string;
}

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'MARKETING' as User['role'],
    password: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users?page=1&pageSize=100');
      setUsers(res.data.users);
      setLoading(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', role: 'MARKETING', password: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role, password: '', isActive: user.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
          password: form.password || undefined,
        });
      } else {
        await axios.post('/api/users', {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Save failed');
    }
  };

  const deactivateUser = async (user: User) => {
    if (!confirm(`Deactivate user ${user.name}?`)) return;
    await axios.delete(`/api/users/${user.id}`);
    fetchUsers();
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Users</h1>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          Add User
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Active</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.name}</td>
                <td className="px-3 py-2 break-all">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.isActive ? 'Yes' : 'No'}</td>
                <td className="px-3 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    onClick={() => openEdit(u)}
                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  {u.isActive && (
                    <button
                      onClick={() => deactivateUser(u)}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow max-w-md w-full p-4 mx-2">
            <h2 className="text-md font-semibold mb-3">{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="MARKETING">MARKETING</option>
                  <option value="WRITER">WRITER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Password{editingUser && ' (leave blank to keep)'}</label>
                <input
                  type="password"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              {editingUser && (
                <label className="inline-flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2">
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
