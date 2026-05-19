'use server';

import { revalidateTag } from 'next/cache';
import { TGoal } from '@/types/goal';

export const getAllGoals = async (year?: number) => {
  const q = year ? `?year=${year}` : '';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/goals${q}`, {
      next: { tags: ['Goals'] },
    });
    return await res.json();
  } catch {
    return { data: [] };
  }
};

export const createGoal = async (payload: Omit<TGoal, '_id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Goals', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateGoal = async (id: string, payload: Partial<TGoal>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Goals', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const deleteGoal = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/goals/${id}`, {
      method: 'DELETE',
    });
    revalidateTag('Goals', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const syncGoals = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/goals/sync`, {
      method: 'PATCH',
    });
    revalidateTag('Goals', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false };
  }
};
