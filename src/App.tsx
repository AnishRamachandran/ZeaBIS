import { useState } from 'react';
import { LayoutDashboard, FolderKanban } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FolderKanban className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                ProjectFlow
              </h1>
              <p className="text-slate-600">Billing & Management System</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
              <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
              <p className="text-blue-100">Your application is loading...</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <LayoutDashboard className="w-8 h-8 text-green-600 mb-2" />
                <h3 className="font-semibold text-slate-800">Dashboard</h3>
                <p className="text-sm text-slate-600">View project statistics</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <FolderKanban className="w-8 h-8 text-blue-600 mb-2" />
                <h3 className="font-semibold text-slate-800">Projects</h3>
                <p className="text-sm text-slate-600">Manage your projects</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <p className="text-slate-600">Loading full application...</p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppOriginal() {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', name: 'Projects', icon: FolderKanban },
    { id: 'billing', name: 'Billing', icon: FileText },
    { id: 'invoices', name: 'Invoices', icon: DollarSign },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex h-screen">
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  ProjectFlow
                </h1>
                <p className="text-xs text-slate-400">Billing & Management</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700/50">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">System Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">All Systems Active</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'projects' && <ProjectManagement />}
            {currentView === 'billing' && <BillingManagement />}
            {currentView === 'invoices' && <InvoiceManagement />}
            {currentView === 'settings' && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Settings</h2>
                <p className="text-slate-600">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
