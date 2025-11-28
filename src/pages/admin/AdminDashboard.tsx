import { useEffect, useState } from 'react';
import axios from 'axios';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<{
    admins: number;
    marketing: number;
    writers: number;
    totalWorks: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, worksRes] = await Promise.all([
        axios.get('/api/users?page=1&pageSize=1000'),
        axios.get('/api/works'),
      ]);
      const users = usersRes.data.users as any[];
      const works = worksRes.data as any[];
      setStats({
        admins: users.filter((u) => u.role === 'ADMIN').length,
        marketing: users.filter((u) => u.role === 'MARKETING').length,
        writers: users.filter((u) => u.role === 'WRITER').length,
        totalWorks: works.length,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="text-xs text-gray-500">Admins</div>
          <div className="text-2xl font-semibold">{stats.admins}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-xs text-gray-500">Marketing</div>
          <div className="text-2xl font-semibold">{stats.marketing}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-xs text-gray-500">Writers</div>
          <div className="text-2xl font-semibold">{stats.writers}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-xs text-gray-500">Total Works</div>
          <div className="text-2xl font-semibold">{stats.totalWorks}</div>
        </div>
      </div>
    </div>
  );
};
