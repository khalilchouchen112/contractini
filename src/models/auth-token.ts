import mongoose, { Document, Schema } from 'mongoose';

export interface IAuthToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
}


const AuthTokenSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: true
});


export default mongoose.models.AuthToken || mongoose.model<IAuthToken>('AuthToken', AuthTokenSchema);