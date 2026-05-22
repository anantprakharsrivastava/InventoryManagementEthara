import { useState } from 'react';
import Input from '../ui/Input';
import DateInput from '../ui/DateInput';
import Button from '../ui/Button';
import { PROJECT_STATUSES } from '../../utils/constants';

const COLORS = ['#ff5e3a', '#3dffa8', '#f4d35e', '#ff8a65', '#60a5fa', '#c084fc'];

export default function ProjectForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'active',
    dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    color: initial?.color || '#ff5e3a',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      dueDate: form.dueDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
        placeholder="Enter project name"
      />
      <div>
        <label className="text-sm font-medium text-slate-300">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1.5 w-full rounded-xl glass p-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px]"
          placeholder="Describe your project..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-300">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1.5 w-full rounded-xl glass px-3 py-2.5 text-sm text-white outline-none"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-800">{s.label}</option>
            ))}
          </select>
        </div>
        <DateInput
          label="Due Date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm text-slate-300 mb-2 block">Color</label>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`h-8 w-8 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>
          {initial ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
