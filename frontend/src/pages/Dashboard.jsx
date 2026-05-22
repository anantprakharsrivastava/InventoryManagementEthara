import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import Leaderboard from '../components/dashboard/Leaderboard';
import { ProductivityChart, StatusPieChart, PriorityBarChart } from '../components/dashboard/Charts';
import { StatSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .getStats()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const { stats, productivity, tasksByStatus, tasksByPriority, recentProjects, teamActivity } = data || {};

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <span className="pill-tag mb-3 inline-block">Command Overview</span>
        <h1 className="font-display text-3xl font-extrabold text-white lg:text-4xl">
          Hey {user?.name?.split(' ')[0]} — <span className="gradient-text-warm">status live</span>
        </h1>
        <p className="text-[var(--color-muted)] mt-2">Momentum across your operations deck.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.totalProjects || 0} color="#ff5e3a" index={0} />
        <StatCard icon={CheckSquare} label="Total Tasks" value={stats?.totalTasks || 0} color="#3dffa8" index={1} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.completedTasks || 0} color="#f4d35e" index={2} />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats?.overdueTasks || 0} color="#ff5e3a" index={3} />
      </div>

      <Leaderboard />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Productivity (7 days)</h2>
          <ProductivityChart data={productivity || []} />
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tasks by Status</h2>
          <StatusPieChart data={tasksByStatus} />
          <div className="mt-2 text-center">
            <span className="text-3xl font-bold gradient-text">{stats?.completionRate || 0}%</span>
            <p className="text-xs text-slate-500">Completion Rate</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Priority Distribution</h2>
          <PriorityBarChart data={tasksByPriority} />
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link to="/projects" className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProjects?.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No projects yet</p>
            )}
            {recentProjects?.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p._id}`}
                className="flex items-center justify-between rounded-xl p-3 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                  <div>
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(p.updatedAt)}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Team Activity</h2>
        </div>
        <div className="space-y-3">
          {teamActivity?.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">No recent activity</p>
          )}
          {teamActivity?.map((a) => (
            <div key={a._id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/5">
              <Avatar src={a.user?.avatar} name={a.user?.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{a.user?.name}</span>{' '}
                  <span className="text-slate-400">{a.action}</span>
                  {a.project && <span className="text-violet-400"> · {a.project.title}</span>}
                </p>
                <p className="text-xs text-slate-500">{formatDate(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
