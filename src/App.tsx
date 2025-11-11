import { useState } from 'react';
import { LayoutDashboard, FolderKanban, FileText, DollarSign } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProjectManagement from './components/ProjectManagement';
import BillingManagement from './components/BillingManagement';
import InvoiceManagement from './components/InvoiceManagement';

type View = 'dashboard' | 'projects' | 'billing' | 'invoices';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navigation = [
    { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as View, name: 'Projects', icon: FolderKanban },
    { id: 'billing' as View, name: 'Billing', icon: FileText },
    { id: 'invoices' as View, name: 'Invoices', icon: DollarSign },
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
                  onClick={() => setCurrentView(item.id)}
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
