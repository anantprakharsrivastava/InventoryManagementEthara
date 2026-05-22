import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Filter, LayoutGrid, List, CheckSquare, FolderKanban } from 'lucide-react';
import { taskAPI, projectAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { getSocket, joinProject, leaveProject } from '../services/socket';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskModal from '../components/tasks/TaskModal';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DateInput from '../components/ui/DateInput';
import EmptyState from '../components/ui/EmptyState';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDate, isOverdue, cn } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useCelebration, CELEBRATION_TYPES } from '../hooks/useCelebration';

export default function Tasks() {
  const { celebrate } = useCelebration();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [project, setProject] = useState(null);

  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    projectAPI.getAll({ limit: 50 }).then((res) => {
      const list = res.data.data || [];
      setProjects(list);

      if (list.length === 0) {
        setSelectedProject('');
        return;
      }

      if (projectId && list.some((p) => p._id === projectId)) {
        setSelectedProject(projectId);
        return;
      }

      setSelectedProject((current) => {
        if (current && list.some((p) => p._id === current)) return current;
        return list[0]._id;
      });
    });
  }, [projectId]);

  const fetchTasks = async () => {
    if (!selectedProject) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = {
        project: selectedProject,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      };
      const [tasksRes, projectRes] = await Promise.all([
        taskAPI.getAll(params),
        projectAPI.getOne(selectedProject),
      ]);
      setTasks(tasksRes.data.data);
      setProject(projectRes.data.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (selectedProject) {
      joinProject(selectedProject);
      const socket = getSocket();
      socket?.on('task:created', (t) => setTasks((prev) => [...prev, t]));
      socket?.on('task:updated', (t) => setTasks((prev) => prev.map((item) => (item._id === t._id ? t : item))));
      socket?.on('task:deleted', ({ id }) => setTasks((prev) => prev.filter((t) => t._id !== id)));
      return () => {
        leaveProject(selectedProject);
        socket?.off('task:created');
        socket?.off('task:updated');
        socket?.off('task:deleted');
      };
    }
  }, [selectedProject, debouncedSearch, statusFilter, priorityFilter]);

  const handleOpenAddTask = () => {
    if (!selectedProject) {
      toast.error('Please select a project from dropdown to add task');
      return;
    }
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await taskAPI.create({
        ...form,
        project: selectedProject,
        assignedTo: form.assignedTo || undefined,
        dueDate: form.dueDate || undefined,
      });
      setTasks((prev) => [...prev, data.data]);
      setShowCreate(false);
      setForm({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '', dueDate: '' });
      celebrate(CELEBRATION_TYPES.TASK_CREATED);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="pill-tag mb-2 inline-block">03 — Velocity</span>
          <h1 className="font-display text-3xl font-extrabold text-white">Tasks</h1>
          <p className="text-[var(--color-muted)] mt-1">Kanban command lane</p>
        </div>
        <Button icon={Plus} onClick={handleOpenAddTask} size="lg">
          Add Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-xl glass px-4 py-2.5 text-sm text-white outline-none min-w-[200px]"
        >
          {projects.length === 0 ? (
            <option value="" className="bg-slate-800">No projects yet</option>
          ) : (
            projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-slate-800">{p.title}</option>
            ))
          )}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="rounded-xl glass px-4 py-2.5 text-sm text-white outline-none flex-1 min-w-[160px] max-w-xs"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl glass px-3 py-2.5 text-sm text-white outline-none">
          <option value="" className="bg-slate-800">All Status</option>
          {TASK_STATUSES.map((s) => <option key={s.id} value={s.id} className="bg-slate-800">{s.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="rounded-xl glass px-3 py-2.5 text-sm text-white outline-none">
          <option value="" className="bg-slate-800">All Priority</option>
          {PRIORITIES.map((p) => <option key={p.id} value={p.id} className="bg-slate-800">{p.label}</option>)}
        </select>
        <div className="flex rounded-xl glass p-1 ml-auto">
          <button onClick={() => setView('kanban')} className={cn('p-2 rounded-lg transition-all', view === 'kanban' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400')}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-all', view === 'list' ? 'bg-violet-500/20 text-violet-300' : 'text-slate-400')}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {projects.length === 0 && !loading ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project first, then you can add tasks here"
          action={
            <Link to="/projects?create=1">
              <Button icon={Plus} size="lg">Add Project</Button>
            </Link>
          }
        />
      ) : !selectedProject ? (
        <EmptyState
          icon={Filter}
          title="Select a project"
          description="Choose a project from the dropdown above, then click Add Task"
          action={
            projects.length > 0 ? (
              <p className="text-xs text-slate-500">Or create another project from the Projects page</p>
            ) : null
          }
        />
      ) : loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="min-w-[280px] flex-1 h-96 glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Add your first task to this project"
          action={
            <Button icon={Plus} onClick={handleOpenAddTask} size="lg">
              Add Task
            </Button>
          }
        />
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onTasksChange={setTasks}
          onTaskClick={setSelectedTask}
          projectId={selectedProject}
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="text-left p-4">Task</th>
                <th className="text-left p-4 hidden md:table-cell">Status</th>
                <th className="text-left p-4 hidden md:table-cell">Priority</th>
                <th className="text-left p-4 hidden lg:table-cell">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => setSelectedTask(t)}
                  className={cn('border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all', isOverdue(t.dueDate, t.status) && 'bg-red-500/5')}
                >
                  <td className="p-4 font-medium text-white">{t.title}</td>
                  <td className="p-4 hidden md:table-cell"><StatusBadge status={t.status} /></td>
                  <td className="p-4 hidden md:table-cell"><PriorityBadge priority={t.priority} /></td>
                  <td className={cn('p-4 hidden lg:table-cell', isOverdue(t.dueDate, t.status) ? 'text-red-400' : 'text-slate-400')}>
                    {formatDate(t.dueDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={(updated) => {
          setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
          setSelectedTask(updated);
        }}
        members={project?.members || []}
      />

      <button
        type="button"
        onClick={handleOpenAddTask}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-btn shadow-lg shadow-violet-500/30"
        aria-label="Add task"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div>
            <label className="text-sm text-slate-300">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 w-full rounded-xl glass p-3 text-sm text-white outline-none min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-eth mt-1.5 w-full text-sm"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input-eth mt-1.5 w-full text-sm"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Assignee</label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="input-eth mt-1.5 w-full text-sm"
            >
              <option value="" className="bg-slate-900">Unassigned</option>
              {project?.members?.map((m) => (
                <option key={m.user?._id} value={m.user?._id} className="bg-slate-900">{m.user?.name}</option>
              ))}
            </select>
          </div>
          <DateInput label="Due Date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <Button type="submit" className="w-full" loading={submitting}>Create Task</Button>
        </form>
      </Modal>
    </div>
  );
}
