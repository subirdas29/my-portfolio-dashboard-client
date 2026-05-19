'use server';

import { revalidateTag } from 'next/cache';
import { TCertification } from '@/types/certification';

export const getAllCertifications = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/certifications`, {
      next: { tags: ['Certifications'] },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
};

export const createCertification = async (payload: Omit<TCertification, '_id' | 'createdAt'>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/certifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Certifications', '');
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateCertification = async (id: string, payload: Partial<TCertification>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/certifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Certifications', '');
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const deleteCertification = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/certifications/${id}`, {
      method: 'DELETE',
    });
    revalidateTag('Certifications', '');
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};
