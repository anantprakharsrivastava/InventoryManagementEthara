export const TASK_STATUSES = [
  { id: 'todo', label: 'Todo', color: '#8b8fa3' },
  { id: 'in-progress', label: 'In Progress', color: '#f4d35e' },
  { id: 'review', label: 'Review', color: '#ff5e3a' },
  { id: 'completed', label: 'Completed', color: '#3dffa8' },
];

export const PRIORITIES = [
  { id: 'low', label: 'Low', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  { id: 'medium', label: 'Medium', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

export const PROJECT_STATUSES = [
  { id: 'planning', label: 'Planning' },
  { id: 'active', label: 'Active' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
