import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  address?: string;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Hide by default
  role: { type: String, required: true, enum: ['USER', 'ADMIN'], default: 'USER' },
  phone: { type: String },
  address: { type: String },
}, {
  timestamps: true
});

// Ensure password is included when explicitly requested
UserSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        const bcrypt = require('bcryptjs');
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);