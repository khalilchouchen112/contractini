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
}, {
  timestamps: true
});

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
