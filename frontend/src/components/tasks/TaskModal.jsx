import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import DateInput from '../ui/DateInput';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { taskAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useCelebration, CELEBRATION_TYPES } from '../../hooks/useCelebration';
import { MessageSquare, Paperclip, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TaskModal({ task, isOpen, onClose, onUpdate, members = [] }) {
  const { user, isAdmin } = useAuth();
  const { celebrate } = useCelebration();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  if (!task) return null;

  const canEdit = isAdmin || task.assignedTo?._id === user?._id || task.assignedTo === user?._id;

  const startEdit = () => {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const wasCompleted = task.status === 'completed';
      const { data } = await taskAPI.update(task._id, form);
      onUpdate(data.data);
      setEditMode(false);
      if (!wasCompleted && form.status === 'completed') {
        celebrate(CELEBRATION_TYPES.TASK_COMPLETED, {
          message: `"${form.title || task.title}" is officially done.`,
        });
      } else {
        toast.success('Task updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const { data } = await taskAPI.addComment(task._id, comment);
      onUpdate(data.data);
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await taskAPI.upload(task._id, file);
      onUpdate(data.data);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editMode ? 'Edit Task' : task.title} size="lg">
      {editMode ? (
        <div className="space-y-4">
          {isAdmin && (
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          )}
          <div>
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1.5 w-full rounded-xl glass p-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 min-h-[100px]"
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
                {TASK_STATUSES.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-800">{s.label}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="text-sm text-slate-300">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="mt-1.5 w-full rounded-xl glass px-3 py-2.5 text-sm text-white outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-800">{p.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {isAdmin && (
            <>
              <div>
                <label className="text-sm text-slate-300">Assignee</label>
                <select
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  className="mt-1.5 w-full rounded-xl glass px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="" className="bg-slate-800">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user?._id || m._id} value={m.user?._id || m._id} className="bg-slate-800">
                      {m.user?.name || m.name}
                    </option>
                  ))}
                </select>
              </div>
              <DateInput label="Due Date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={loading}>Save Changes</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          {task.description && (
            <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Assignee</span>
              <div className="mt-1 flex items-center gap-2">
                {task.assignedTo ? (
                  <>
                    <Avatar src={task.assignedTo.avatar} name={task.assignedTo.name} size="sm" />
                    <span className="text-white">{task.assignedTo.name}</span>
                  </>
                ) : (
                  <span className="text-slate-400">Unassigned</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Due Date</span>
              <p className="mt-1 text-white">{formatDate(task.dueDate)}</p>
            </div>
          </div>

          {task.attachments?.length > 0 && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Attachments</p>
              {task.attachments.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="text-sm text-violet-400 hover:underline block">
                  {a.filename}
                </a>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-white">Comments ({task.comments?.length || 0})</span>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
              {task.comments?.map((c) => (
                <div key={c._id} className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar src={c.user?.avatar} name={c.user?.name} size="sm" />
                    <span className="text-xs font-medium text-white">{c.user?.name}</span>
                    <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl glass px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/30"
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <Button icon={Send} onClick={handleComment} loading={loading} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEdit && <Button variant="secondary" onClick={startEdit}>Edit</Button>}
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <span className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition-all">
                <Paperclip className="h-4 w-4" /> Attach File
              </span>
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
