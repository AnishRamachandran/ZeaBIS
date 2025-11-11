import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Download, AlertCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';
import BillingForm from './BillingForm';

type BillingData = Database['public']['Tables']['billing_data']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface BillingWithProject extends BillingData {
  project?: Project;
}

function BillingManagement() {
  const [billingData, setBillingData] = useState<BillingWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('billing_data')
        .select('*, project:projects(*)')
        .order('billing_period', { ascending: false });

      if (error) throw error;
      setBillingData(data || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadBillingData();
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Project Name', 'Billing Period', 'Hours Billed', 'Bill Rate', 'Invoice Amount', 'Cumulative Hours', 'Utilization %'].join(','),
      ...billingData.map(b => [
        b.project?.project_name || '',
        b.billing_period,
        b.hours_billed,
        b.bill_rate_used,
        b.invoice_amount,
        b.cumulative_hours,
        b.utilization_percentage.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredBilling = selectedPeriod === 'all'
    ? billingData
    : billingData.filter(b => b.billing_period.startsWith(selectedPeriod));

  const totalHoursBilled = filteredBilling.reduce((sum, b) => sum + b.hours_billed, 0);
  const totalInvoiceAmount = filteredBilling.reduce((sum, b) => sum + b.invoice_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Billing Management</h2>
          <p className="text-slate-600 mt-1">Track monthly billing and hours</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export to Excel</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Billing</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-blue-100 text-sm font-medium mb-2">Total Hours Billed</p>
          <p className="text-4xl font-bold">{totalHoursBilled.toFixed(2)}</p>
          <p className="text-blue-100 text-sm mt-2">Across all projects</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-green-100 text-sm font-medium mb-2">Total Invoice Amount</p>
          <p className="text-4xl font-bold">${totalInvoiceAmount.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-2">Current period</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-orange-100 text-sm font-medium mb-2">Projects Tracked</p>
          <p className="text-4xl font-bold">{new Set(billingData.map(b => b.project_id)).size}</p>
          <p className="text-orange-100 text-sm mt-2">Active billing</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Periods</option>
            <option value={new Date().getFullYear().toString()}>This Year</option>
            <option value={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}>
              This Month
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Project Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Billing Period</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Hours Billed</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Bill Rate</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Invoice Amount</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Cumulative Hours</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {filteredBilling.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No billing data found. Add your first billing entry!
                  </td>
                </tr>
              ) : (
                filteredBilling.map((billing) => (
                  <tr key={billing.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{billing.project?.project_name}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(billing.billing_period).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-800 font-medium">{billing.hours_billed}</td>
                    <td className="py-4 px-4 text-right text-slate-600">${billing.bill_rate_used}</td>
                    <td className="py-4 px-4 text-right text-slate-800 font-semibold">
                      ${billing.invoice_amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-600">{billing.cumulative_hours}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <span
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getUtilizationColor(
                            billing.utilization_percentage
                          )}`}
                        >
                          {billing.utilization_percentage >= 80 && <AlertCircle className="w-3 h-3" />}
                          <span>{billing.utilization_percentage.toFixed(1)}%</span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <BillingForm onClose={handleFormClose} />}
    </div>
  );
}

export default BillingManagement;
