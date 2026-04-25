import { z } from 'zod';

export const UserProfileSchema = z.object({
  _id: z.string(),
  clerkId: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  linkedinUrl: z.string().url().nullable(),
  resumes: z.array(z.string()), // ObjectId references
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
