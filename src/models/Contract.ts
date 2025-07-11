import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  employee: string;
  type: 'CDD' | 'CDI' | 'Internship' | 'Terminated';
  startDate: Date;
  endDate?: Date;
  status: 'Active' | 'Expired' | 'Expiring Soon' | 'Terminated';
  documents?: Array<{
    fileName: string;
    fileUrl: string;
    uploadDate: Date;
  }>;
}

const ContractSchema: Schema = new Schema({
  employee: { type: String, required: true },
  type: { type: String, required: true, enum: ['CDD', 'CDI', 'Internship', 'Terminated'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  status: { type: String, required: true, enum: ['Active', 'Expired', 'Expiring Soon', 'Terminated'] },
  documents: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
  }]
});

export default mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
