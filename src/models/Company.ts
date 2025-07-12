import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address: string;
  phone?: string;
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String },
  owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
