import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Edit } from 'lucide-react';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { joinProject, leaveProject } from '../services/socket';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import { StatusBadge } from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = async () => {
    if (!id || id === 'undefined') {
      toast.error('Invalid project');
      navigate('/projects');
      setLoading(false);
      return;
    }
    try {
      const { data } = await projectAPI.getOne(id);
      setProject(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load project';
      toast.error(msg);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || id === 'undefined') return;
    fetchProject();
    joinProject(id);
    return () => leaveProject(id);
  }, [id]);

  const searchUsers = async (q) => {
    if (!q) return setUsers([]);
    const { data } = await projectAPI.searchUsers(q);
    setUsers(data.data);
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await projectAPI.update(id, formData);
      setProject(data.data);
      setEditModal(false);
      toast.success('Project updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const { data } = await projectAPI.addMember(id, { userId });
      setProject(data.data);
      setMemberModal(false);
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const { data } = await projectAPI.removeMember(id, userId);
      setProject(data.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isProjectAdmin =
    isAdmin ||
    project?.createdBy?._id === user?._id ||
    project?.admins?.some((a) => (a._id || a) === user?._id);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded-xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </button>

      <div className="glass rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-4 w-4 rounded-full mt-2 shrink-0" style={{ background: project.color }} />
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{project.title}</h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-slate-400 max-w-2xl">{project.description}</p>
              {project.dueDate && (
                <p className="text-sm text-slate-500 mt-2">Due: {formatDate(project.dueDate)}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/tasks?project=${id}`}>
              <Button variant="secondary">View Tasks</Button>
            </Link>
            {isProjectAdmin && (
              <>
                <Button variant="secondary" icon={Edit} onClick={() => setEditModal(true)}>Edit</Button>
                {isAdmin && (
                  <Button variant="danger" icon={Trash2} onClick={() => setDeleteModal(true)}>Delete</Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Team Members</h2>
          {isProjectAdmin && (
            <Button size="sm" icon={UserPlus} onClick={() => setMemberModal(true)}>Add Member</Button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {project.members?.map((m) => (
            <div key={m.user?._id || m.user} className="flex items-center justify-between rounded-xl glass p-3">
              <div className="flex items-center gap-3">
                <Avatar src={m.user?.avatar} name={m.user?.name} />
                <div>
                  <p className="text-sm font-medium text-white">{m.user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{m.role}</p>
                </div>
              </div>
              {isProjectAdmin && m.user?._id !== user?._id && m.user?._id !== project.createdBy?._id && (
                <button
                  onClick={() => handleRemoveMember(m.user._id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Project">
        <ProjectForm initial={project} onSubmit={handleUpdate} onCancel={() => setEditModal(false)} loading={submitting} />
      </Modal>

      <Modal isOpen={memberModal} onClose={() => setMemberModal(false)} title="Add Team Member">
        <Input
          label="Search by name or email"
          value={memberEmail}
          onChange={(e) => {
            setMemberEmail(e.target.value);
            searchUsers(e.target.value);
          }}
          placeholder="Type to search..."
        />
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleAddMember(u._id)}
              className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-all"
            >
              <Avatar src={u.avatar} name={u.name} size="sm" />
              <div className="text-left">
                <p className="text-sm text-white">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="This will permanently delete the project and all its tasks. This action cannot be undone."
        loading={submitting}
      />
    </div>
  );
}
