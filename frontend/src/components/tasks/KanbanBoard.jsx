import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Calendar, AlertCircle } from 'lucide-react';
import { TASK_STATUSES } from '../../utils/constants';
import { PriorityBadge } from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, isOverdue, cn } from '../../utils/helpers';
import { taskAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useCelebration, CELEBRATION_TYPES } from '../../hooks/useCelebration';

function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      onClick={() => onClick(task)}
      className={cn(
        'cursor-pointer rounded-xl border border-white/[0.06] bg-black/30 p-4 transition-all hover:border-[var(--color-ember)]/25 hover:bg-black/50 group',
        overdue && 'ring-1 ring-red-500/40'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-white line-clamp-2">{task.title}</p>
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
        {overdue && <AlertCircle className="h-3.5 w-3.5 text-red-400" />}
      </div>
      <div className="flex items-center justify-between">
        {task.assignedTo ? (
          <Avatar src={task.assignedTo.avatar} name={task.assignedTo.name} size="sm" />
        ) : (
          <span className="text-xs text-slate-500">Unassigned</span>
        )}
        {task.dueDate && (
          <span className={cn('flex items-center gap-1 text-xs', overdue ? 'text-red-400' : 'text-slate-500')}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function KanbanColumn({ status, tasks, onTaskClick }) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col eth-card p-4 border-t-2" style={{ borderTopColor: status.color }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">{status.label}</h3>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono"
          style={{ background: `${status.color}22`, color: status.color }}
        >
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-3 min-h-[100px]">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ tasks, onTasksChange, onTaskClick, projectId }) {
  const { celebrate } = useCelebration();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getColumnTasks = (statusId) =>
    tasks.filter((t) => t.status === statusId).sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const task = tasks.find((t) => t._id === activeId);
    if (!task) return;

    let newStatus = task.status;
    const overTask = tasks.find((t) => t._id === over.id);

    if (overTask) {
      newStatus = overTask.status;
    } else if (TASK_STATUSES.some((s) => s.id === over.id)) {
      newStatus = over.id;
    }

    if (newStatus === task.status && overTask) return;

    const justCompleted = newStatus === 'completed' && task.status !== 'completed';

    const updated = tasks.map((t) =>
      t._id === activeId ? { ...t, status: newStatus } : t
    );
    onTasksChange(updated);

    try {
      await taskAPI.update(activeId, { status: newStatus });
      const reorderPayload = updated
        .filter((t) => t.status === newStatus)
        .map((t, i) => ({
          id: t._id,
          status: newStatus,
          order: i,
          projectId,
        }));
      await taskAPI.reorder(reorderPayload);
      if (justCompleted) {
        celebrate(CELEBRATION_TYPES.TASK_COMPLETED, {
          message: `"${task.title}" is done. Ship it!`,
        });
      }
    } catch {
      toast.error('Failed to update task');
      onTasksChange(tasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveTask(tasks.find((t) => t._id === e.active.id))}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => (
          <div key={status.id} id={status.id}>
            <KanbanColumn
              status={status}
              tasks={getColumnTasks(status.id)}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="glass rounded-xl p-4 w-[260px] shadow-2xl opacity-90">
            <p className="text-sm font-medium text-white">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
