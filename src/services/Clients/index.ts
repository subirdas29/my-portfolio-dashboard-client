'use server';

import { revalidateTag } from 'next/cache';
import { TClient } from '@/types/client';

export const getAllClients = async (params?: Record<string, string>) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/clients?${queryString}`,
      { next: { tags: ['Clients'] } },
    );
    return await res.json();
  } catch {
    return { data: { result: [], meta: {} } };
  }
};

export const getClientById = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/clients/${id}`, {
      next: { tags: ['Clients'] },
    });
    return await res.json();
  } catch {
    return { data: null };
  }
};

export const createClient = async (payload: Omit<TClient, '_id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Clients', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateClient = async (id: string, payload: Partial<TClient>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Clients', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const getClientWithStats = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/clients/${id}/stats`, {
      next: { tags: ['Clients'] },
    });
    return await res.json();
  } catch {
    return { data: null };
  }
};

export const deleteClient = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/clients/${id}`, {
      method: 'DELETE',
    });
    revalidateTag('Clients', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};
