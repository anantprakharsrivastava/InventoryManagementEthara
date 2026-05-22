import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import { formatDate } from '../../utils/helpers';

export default function ProjectCard({ project, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 120 }}
    >
      <Link
        to={`/projects/${project._id}`}
        className="group relative block eth-card-hover overflow-hidden p-6"
      >
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
          style={{ background: project.color || '#ff5e3a' }}
        />

        <div className="relative flex items-start justify-between mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-lg font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${project.color || '#ff5e3a'}44, rgba(0,0,0,0.4))`,
              border: `1px solid ${project.color || '#ff5e3a'}55`,
            }}
          >
            {project.title?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} />
            <ArrowUpRight className="h-4 w-4 text-[var(--color-muted)] transition-all group-hover:text-[var(--color-mint)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-white group-hover:gradient-text-warm transition-all mb-2 line-clamp-1">
          {project.title}
        </h3>
        <p className="text-sm text-[var(--color-muted)] line-clamp-2 mb-5 leading-relaxed">{project.description}</p>

        <div className="flex items-center justify-between text-xs text-[var(--color-muted)] border-t border-white/[0.06] pt-4">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--color-ember)]" />
            {project.members?.length || 0} crew
          </span>
          {project.dueDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(project.dueDate)}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
