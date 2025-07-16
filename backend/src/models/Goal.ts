import mongoose, { Document, Schema } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'strength' | 'endurance' | 'weight' | 'body_composition' | 'flexibility' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  status: 'active' | 'completed' | 'abandoned';
  progressHistory: Array<{
    date: Date;
    value: number;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['strength', 'endurance', 'weight', 'body_composition', 'flexibility', 'custom'],
    required: true
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  deadline: {
    type: Date,
    validate: {
      validator: function(this: IGoal, value: Date) {
        return !value || value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  progressHistory: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ deadline: 1, status: 1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercentage').get(function(this: IGoal) {
  if (this.targetValue === 0) return 0;
  return Math.min((this.currentValue / this.targetValue) * 100, 100);
});

// Method to update progress
GoalSchema.methods.updateProgress = function(value: number, notes?: string) {
  this.currentValue = value;
  this.progressHistory.push({
    date: new Date(),
    value,
    notes
  });
  
  // Auto-complete if target reached
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
  }
  
  return this.save();
};

// Method to check if goal is overdue
GoalSchema.methods.isOverdue = function() {
  return this.deadline && this.deadline < new Date() && this.status === 'active';
};

// Pre-save middleware to update status based on progress
GoalSchema.pre('save', function(next) {
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema); 