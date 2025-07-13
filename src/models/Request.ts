import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  employee: mongoose.Types.ObjectId;
  contract: mongoose.Types.ObjectId;
  type: 'renewal' | 'termination' | 'status_change';
  currentStatus: string;
  requestedStatus?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema: Schema = new Schema({
  employee: { 
    type: mongoose.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  contract: { 
    type: mongoose.Types.ObjectId, 
    ref: 'Contract', 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['renewal', 'termination', 'status_change'] 
  },
  currentStatus: { 
    type: String, 
    required: true 
  },
  requestedStatus: { 
    type: String 
  },
  reason: { 
    type: String 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNotes: { 
    type: String 
  },
  processedBy: { 
    type: mongoose.Types.ObjectId, 
    ref: 'User' 
  },
  processedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

export default mongoose.models.Request || mongoose.model<IRequest>('Request', RequestSchema);