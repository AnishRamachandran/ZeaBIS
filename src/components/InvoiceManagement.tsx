import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Download, Eye } from 'lucide-react';
import type { Database } from '../lib/database.types';
import InvoiceForm from './InvoiceForm';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface InvoiceWithProject extends Invoice {
  project?: Project;
}

function InvoiceManagement() {
  const [invoices, setInvoices] = useState<InvoiceWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('*, project:projects(*)')
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadInvoices();
  };

  const exportInvoices = () => {
    const csvContent = [
      ['Invoice Number', 'Project Name', 'Invoice Date', 'Amount', 'Cumulative Invoiced', 'Remaining Balance', 'Status'].join(','),
      ...filteredInvoices.map(inv => [
        inv.invoice_number,
        inv.project?.project_name || '',
        inv.invoice_date,
        inv.invoice_amount,
        inv.cumulative_invoiced,
        inv.remaining_balance,
        inv.invoice_status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.invoice_status === statusFilter);

  const totalInvoiced = filteredInvoices.reduce((sum, inv) =>
    inv.invoice_status !== 'Cancelled' ? sum + inv.invoice_amount : sum, 0
  );
  const totalPending = filteredInvoices.filter(inv => inv.invoice_status === 'Sent').length;
  const totalPaid = filteredInvoices.filter(inv => inv.invoice_status === 'Paid').length;

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
          <h2 className="text-3xl font-bold text-slate-800">Invoice Management</h2>
          <p className="text-slate-600 mt-1">Track and manage all your invoices</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportInvoices}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-blue-100 text-sm font-medium mb-2">Total Invoiced</p>
          <p className="text-4xl font-bold">${totalInvoiced.toLocaleString()}</p>
          <p className="text-blue-100 text-sm mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-orange-100 text-sm font-medium mb-2">Pending Invoices</p>
          <p className="text-4xl font-bold">{totalPending}</p>
          <p className="text-orange-100 text-sm mt-2">Awaiting payment</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
          <p className="text-green-100 text-sm font-medium mb-2">Paid Invoices</p>
          <p className="text-4xl font-bold">{totalPaid}</p>
          <p className="text-green-100 text-sm mt-2">Successfully collected</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Invoice #</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Project Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-slate-700">Invoice Date</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Amount</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Cumulative</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-slate-700">Balance</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No invoices found. Create your first invoice!
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{invoice.invoice_number}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{invoice.project?.project_name}</td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-800 font-semibold">
                      ${invoice.invoice_amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-600">
                      ${invoice.cumulative_invoiced.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={invoice.remaining_balance < 0 ? 'text-red-600 font-semibold' : 'text-slate-800'}>
                        ${invoice.remaining_balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.invoice_status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.invoice_status === 'Sent'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.invoice_status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : invoice.invoice_status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.invoice_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <InvoiceForm onClose={handleFormClose} />}
    </div>
  );
}

export default InvoiceManagement;
