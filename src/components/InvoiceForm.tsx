import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type BillingData = Database['public']['Tables']['billing_data']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

interface InvoiceFormProps {
  onClose: () => void;
}

function InvoiceForm({ onClose }: InvoiceFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [billingData, setBillingData] = useState<BillingData[]>([]);
  const [formData, setFormData] = useState<InvoiceInsert>({
    project_id: '',
    billing_data_id: null,
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_amount: 0,
    invoice_status: 'Draft',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      loadBillingData(formData.project_id);
    }
  }, [formData.project_id]);

  useEffect(() => {
    if (formData.billing_data_id) {
      const billing = billingData.find(b => b.id === formData.billing_data_id);
      if (billing) {
        setFormData(prev => ({ ...prev, invoice_amount: billing.invoice_amount }));
      }
    }
  }, [formData.billing_data_id, billingData]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_status', 'Active')
        .order('project_name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadBillingData = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('billing_data')
        .select('*')
        .eq('project_id', projectId)
        .order('billing_period', { ascending: false });

      if (error) throw error;
      setBillingData(data || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase.from('invoices').insert([formData]);
      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Error saving invoice. Please check if invoice number already exists.');
    } finally {
      setSaving(false);
    }
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">Create Invoice</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Number *
              </label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project *
            </label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value, billing_data_id: null })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} - PO Value: ${project.po_value.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {formData.project_id && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Link to Billing Period (Optional)
              </label>
              <select
                value={formData.billing_data_id || ''}
                onChange={(e) => setFormData({ ...formData, billing_data_id: e.target.value || null })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Manual entry</option>
                {billingData.map((billing) => (
                  <option key={billing.id} value={billing.id}>
                    {new Date(billing.billing_period).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} -
                    {billing.hours_billed}hrs - ${billing.invoice_amount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Invoice Amount *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.invoice_amount}
              onChange={(e) => setFormData({ ...formData, invoice_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Invoice Status
            </label>
            <select
              value={formData.invoice_status}
              onChange={(e) => setFormData({ ...formData, invoice_status: e.target.value as any })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {selectedProject && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-blue-200 space-y-3">
              <h4 className="font-semibold text-slate-800 mb-3">Project Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Total PO Value:</span>
                  <p className="font-semibold text-slate-800">${selectedProject.po_value.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-600">PO Hours:</span>
                  <p className="font-semibold text-slate-800">{selectedProject.po_hours}</p>
                </div>
                <div>
                  <span className="text-slate-600">Bill Rate:</span>
                  <p className="font-semibold text-slate-800">${selectedProject.bill_rate}/hr</p>
                </div>
                <div>
                  <span className="text-slate-600">PO Status:</span>
                  <p className="font-semibold text-slate-800">{selectedProject.po_status}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InvoiceForm;
