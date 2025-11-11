import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalPOValue: number;
  totalBilledHours: number;
  highUtilizationCount: number;
}

function Dashboard() {
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalPOValue: 0,
    totalBilledHours: 0,
    highUtilizationCount: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false }) as { data: Project[] | null; error: any };

      if (projects) {
        const activeProjects = projects.filter(p => p.project_status === 'Active');
        const totalPOValue = projects.reduce((sum, p) => sum + (p.po_value || 0), 0);

        const { data: billingData } = await supabase
          .from('billing_data')
          .select('cumulative_hours, utilization_percentage') as { data: Array<{ cumulative_hours: number; utilization_percentage: number }> | null; error: any };

        const totalBilledHours = billingData?.reduce((sum, b) => sum + (b.cumulative_hours || 0), 0) || 0;
        const highUtilizationCount = billingData?.filter(b => b.utilization_percentage >= 80).length || 0;

        setStats({
          totalProjects: projects.length,
          activeProjects: activeProjects.length,
          totalPOValue,
          totalBilledHours,
          highUtilizationCount,
        });

        setRecentProjects(projects.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };


  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total PO Value',
      value: `$${stats.totalPOValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'High Utilization Alerts',
      value: stats.highUtilizationCount,
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); loadDashboardData(); }}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">Welcome back! Here's what's happening with your projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Recent Projects</h3>
            <Clock className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No projects yet. Create your first project!</p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{project.project_name}</p>
                    <p className="text-sm text-slate-500">{project.project_group || 'No group'}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        project.project_status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : project.project_status === 'On Hold'
                          ? 'bg-yellow-100 text-yellow-800'
                          : project.project_status === 'Completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {project.project_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">New Project</div>
            </button>
            <button className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium">Add Billing</div>
            </button>
            <button className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium">Create Invoice</div>
            </button>
            <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium">View Reports</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
