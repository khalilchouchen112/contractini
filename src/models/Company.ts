import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address: string;
  phone?: string;
  owner: mongoose.Types.ObjectId;
  settings: {
    expiringSoonDays: number;
    autoRenewal: boolean;
    terminationNoticeDays: number;
    contractNotifications: {
      enabled: boolean;
      expiringContractDays: number;
      expiredContractGraceDays: number;
      reminderFrequency: 'daily' | 'weekly' | 'monthly';
      emailNotifications: boolean;
      dashboardNotifications: boolean;
    };
  };
}

const CompanySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String },
  owner: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  settings: {
    expiringSoonDays: { type: Number, default: 30 },
    autoRenewal: { type: Boolean, default: true },
    terminationNoticeDays: { type: Number, default: 60 },
    contractNotifications: {
      enabled: { type: Boolean, default: true },
      expiringContractDays: { type: Number, default: 30 },
      expiredContractGraceDays: { type: Number, default: 7 },
      reminderFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
      emailNotifications: { type: Boolean, default: true },
      dashboardNotifications: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
