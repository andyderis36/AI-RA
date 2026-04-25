import mongoose, { Schema, models, model } from 'mongoose';

export interface IUser {
  clerkId: string;
  email: string;
  name?: string;
  linkedinUrl?: string;
  resumes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    linkedinUrl: { type: String },
    resumes: [{ type: Schema.Types.ObjectId, ref: 'Resume' }],
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>('User', UserSchema);
