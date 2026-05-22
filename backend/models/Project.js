import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'archived'],
      default: 'active',
    },
    members: [memberSchema],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
  },
  { timestamps: true }
);

projectSchema.index({ createdBy: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ title: 'text', description: 'text' });

const toIdString = (ref) => {
  if (!ref) return '';
  if (typeof ref === 'object' && ref._id) return ref._id.toString();
  return ref.toString();
};

projectSchema.methods.isMember = function (userId) {
  const id = userId.toString();
  if (toIdString(this.createdBy) === id) return true;
  return this.members.some((m) => toIdString(m.user) === id);
};

projectSchema.methods.isProjectAdmin = function (userId) {
  const id = userId.toString();
  if (toIdString(this.createdBy) === id) return true;
  if (this.admins?.some((a) => toIdString(a) === id)) return true;
  const member = this.members.find((m) => toIdString(m.user) === id);
  return member?.role === 'admin';
};

const Project = mongoose.model('Project', projectSchema);
export default Project;
