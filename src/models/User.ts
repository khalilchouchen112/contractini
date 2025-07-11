import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['USER', 'ADMIN'], default: 'USER' },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
