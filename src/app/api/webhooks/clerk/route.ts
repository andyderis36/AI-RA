import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Resume } from '@/models/Resume';

/**
 * Clerk Webhook Handler
 * Ensures MongoDB 'User' collection stays perfectly in sync with Clerk authentication state.
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local', {
      status: 500,
    });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    await dbConnect();

    // ── 1. user.created ──────────────────────────────────────────────────
    if (eventType === 'user.created') {
      const email = evt.data.email_addresses[0]?.email_address || 'no-email@clerk.dev';
      const name = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(' ') || undefined;

      await User.findOneAndUpdate(
        { clerkId: id },
        { 
          clerkId: id,
          email,
          name,
        },
        { upsert: true, new: true } // upsert covers race conditions where Server Action triggered first
      );
      
      console.log(`Webhook: User created/upserted in DB [${id}]`);
    }

    // ── 2. user.updated ──────────────────────────────────────────────────
    if (eventType === 'user.updated') {
      const email = evt.data.email_addresses[0]?.email_address;
      const name = [evt.data.first_name, evt.data.last_name].filter(Boolean).join(' ') || undefined;

      const updateData: any = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;

      await User.findOneAndUpdate({ clerkId: id }, updateData);
      
      console.log(`Webhook: User updated in DB [${id}]`);
    }

    // ── 3. user.deleted ──────────────────────────────────────────────────
    if (eventType === 'user.deleted') {
      // Find user to cascade delete resumes
      const user = await User.findOne({ clerkId: id });
      
      if (user) {
        // Optional: you could also delete blobs from Vercel Blob here using @vercel/blob `del()`
        // For now, we only clean up MongoDB records.
        await Resume.deleteMany({ userId: user._id });
        await User.findOneAndDelete({ clerkId: id });
        console.log(`Webhook: User and associated resumes deleted from DB [${id}]`);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error(`Error processing webhook event [${eventType}]:`, error);
    return new Response('Internal Server Error processing webhook', { status: 500 });
  }
}
