import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  type: 'CDD' | 'CDI' | 'Internship' | 'Terminated';
  startDate: Date;
  endDate?: Date;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Terminated';
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadDate: Date;
  }>;
  employee: mongoose.Types.ObjectId;
  lastStatusUpdate?: Date;
  statusHistory?: Array<{
    status: string;
    previousStatus: string;
    updatedAt: Date;
    reason: string;
    updatedBy: string;
  }>;
  company?: mongoose.Types.ObjectId;
}

const ContractSchema: Schema = new Schema({
  employee: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  company: { type: mongoose.Types.ObjectId, ref: 'Company', required: true },
  type: { type: String, required: true, enum: ['CDD', 'CDI', 'Internship', 'Terminated'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, required: true, enum: ['Active', 'Expired', 'Expiring Soon', 'Terminated'] },
  documents: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],
  lastStatusUpdate: { type: Date, default: Date.now },
  statusHistory: [{
    status: { type: String, required: true },
    previousStatus: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    updatedBy: { type: String, required: true, default: 'system' }
  }]
}, {
  timestamps: true
});

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
