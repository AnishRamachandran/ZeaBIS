import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

interface ProjectFormProps {
  project: Project | null;
  onClose: () => void;
}

function ProjectForm({ project, onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectInsert>({
    project_name: '',
    project_group: '',
    project_lead: '',
    team_members: [],
    client_manager: '',
    service_type: '',
    project_status: 'Active',
    po_number: '',
    po_status: 'Pending',
    po_hours: 0,
    approved_hours: 0,
    bill_rate: 0,
    po_value: 0,
  });
  const [teamMemberInput, setTeamMemberInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        project_name: project.project_name,
        project_group: project.project_group,
        project_lead: project.project_lead,
        team_members: project.team_members,
        client_manager: project.client_manager,
        service_type: project.service_type,
        project_status: project.project_status,
        po_number: project.po_number,
        po_status: project.po_status,
        po_hours: project.po_hours,
        approved_hours: project.approved_hours,
        bill_rate: project.bill_rate,
        po_value: project.po_value,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (project) {
        // @ts-ignore - Supabase type inference issue
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', project.id);
        if (error) throw error;
      } else {
        // @ts-ignore - Supabase type inference issue
        const { error } = await supabase.from('projects').insert([formData]);
        if (error) throw error;
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addTeamMember = () => {
    if (teamMemberInput.trim()) {
      setFormData({
        ...formData,
        team_members: [...(formData.team_members || []), teamMemberInput.trim()],
      });
      setTeamMemberInput('');
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      team_members: formData.team_members?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-800">
            {project ? 'Edit Project' : 'New Project'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Group
              </label>
              <input
                type="text"
                value={formData.project_group || ''}
                onChange={(e) => setFormData({ ...formData, project_group: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Lead
              </label>
              <input
                type="text"
                value={formData.project_lead || ''}
                onChange={(e) => setFormData({ ...formData, project_lead: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Client Manager
              </label>
              <input
                type="text"
                value={formData.client_manager || ''}
                onChange={(e) => setFormData({ ...formData, client_manager: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Service Type
              </label>
              <input
                type="text"
                value={formData.service_type || ''}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project Status
              </label>
              <select
                value={formData.project_status}
                onChange={(e) => setFormData({ ...formData, project_status: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={formData.po_number || ''}
                onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PO Status
              </label>
              <select
                value={formData.po_status}
                onChange={(e) => setFormData({ ...formData, po_status: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PO Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.po_hours}
                onChange={(e) => setFormData({ ...formData, po_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Approved Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.approved_hours}
                onChange={(e) => setFormData({ ...formData, approved_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Bill Rate ($/hr)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.bill_rate}
                onChange={(e) => setFormData({ ...formData, bill_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PO Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.po_value}
                onChange={(e) => setFormData({ ...formData, po_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={teamMemberInput}
                onChange={(e) => setTeamMemberInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                placeholder="Enter team member name"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addTeamMember}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.team_members?.map((member, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg"
                >
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
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
              {saving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
