import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { projectAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { useCelebration, CELEBRATION_TYPES } from '../hooks/useCelebration';

export default function Projects() {
  const { celebrate } = useCelebration();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const openCreateModal = () => {
    setShowModal(true);
    setSearchParams({ create: '1' });
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setSearchParams({});
  };

  useEffect(() => {
    if (searchParams.get('create') === '1') setShowModal(true);
  }, [searchParams]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectAPI.getAll({ search: debouncedSearch || undefined });
      setProjects(data.data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProjects();
  }, [debouncedSearch]);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await projectAPI.create(formData);
      closeCreateModal();
      fetchProjects();
      celebrate(CELEBRATION_TYPES.PROJECT_CREATED);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="pill-tag mb-2 inline-block">02 — Ops</span>
          <h1 className="font-display text-3xl font-extrabold text-white">Projects</h1>
          <p className="text-[var(--color-muted)] mt-1">Your mission folders — built to stand out.</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal} size="lg">
          Add Project
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl glass py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <Button variant="secondary" icon={Plus} onClick={openCreateModal} className="sm:hidden">
          Add Project
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project, then add tasks from the Tasks page"
          action={
            <Button icon={Plus} onClick={openCreateModal} size="lg">
              Create Project
            </Button>
          }
        />
      ) : (
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} project={p} index={i} />
          ))}
        </motion.div>
      )}

      {/* Floating action button */}
      <button
        type="button"
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-btn shadow-lg shadow-violet-500/30 lg:hidden"
        aria-label="Add project"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      <Modal isOpen={showModal} onClose={closeCreateModal} title="Create Project">
        <ProjectForm onSubmit={handleCreate} onCancel={closeCreateModal} loading={submitting} />
      </Modal>
    </div>
  );
}
