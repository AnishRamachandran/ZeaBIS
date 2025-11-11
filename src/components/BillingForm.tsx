import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type BillingInsert = Database['public']['Tables']['billing_data']['Insert'];

interface BillingFormProps {
  onClose: () => void;
}

function BillingForm({ onClose }: BillingFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<BillingInsert>({
    project_id: '',
    billing_period: new Date().toISOString().slice(0, 7) + '-01',
    hours_billed: 0,
    bill_rate_used: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (formData.project_id) {
      const project = projects.find(p => p.id === formData.project_id);
      if (project) {
        setFormData(prev => ({ ...prev, bill_rate_used: project.bill_rate }));
      }
    }
  }, [formData.project_id, projects]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase.from('billing_data').insert([formData]);
      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error saving billing data:', error);
      alert('Error saving billing data. Please check if an entry already exists for this period.');
    } finally {
      setSaving(false);
    }
  };

  const invoiceAmount = (formData.hours_billed || 0) * (formData.bill_rate_used || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">Add Billing Data</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Project *
            </label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name} - {project.po_number || 'No PO'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Billing Period *
            </label>
            <input
              type="date"
              required
              value={formData.billing_period}
              onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Select the first day of the billing month</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Hours Billed *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.hours_billed}
              onChange={(e) => setFormData({ ...formData, hours_billed: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bill Rate ($/hr) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.bill_rate_used}
              onChange={(e) => setFormData({ ...formData, bill_rate_used: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Auto-filled from project settings</p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700 font-medium">Calculated Invoice Amount:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {formData.hours_billed} hours × ${formData.bill_rate_used}/hr
            </p>
          </div>

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
              {saving ? 'Saving...' : 'Add Billing Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillingForm;
