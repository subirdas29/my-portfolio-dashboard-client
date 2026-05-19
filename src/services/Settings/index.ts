'use server';
import { revalidateTag } from 'next/cache';

export type TSettings = {
  _id?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  ownerBio?: string;
  ownerTitle?: string;
  avatarUrl?: string;
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  availableForWork: boolean;
  hourlyRate?: number;
  currency: string;
  timezone?: string;
  siteTitle?: string;
  siteDescription?: string;
};

export const getSettings = async (): Promise<{ data: TSettings | null }> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/settings`, {
      next: { tags: ['Settings'] },
    });
    return await res.json();
  } catch {
    return { data: null };
  }
};

export const updateSettings = async (payload: Partial<TSettings>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Settings', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};
