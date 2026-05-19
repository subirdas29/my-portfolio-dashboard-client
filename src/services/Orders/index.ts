'use server';

import { revalidateTag } from 'next/cache';
import { TOrder } from '@/types/order';

export const getAllOrders = async (params?: Record<string, string>) => {
  const queryString = params ? new URLSearchParams(params).toString() : '';
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/orders?${queryString}`,
      { next: { tags: ['Orders'] } },
    );
    return await res.json();
  } catch {
    return { data: { result: [], meta: {} } };
  }
};

export const getOrderById = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders/${id}`, {
      next: { tags: ['Orders'] },
    });
    return await res.json();
  } catch {
    return { data: null };
  }
};

export const getRevenueByMonth = async (months = 6) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/orders/revenue?months=${months}`,
      { next: { tags: ['Orders'], revalidate: 300 } },
    );
    return await res.json();
  } catch {
    return { data: [] };
  }
};

export const createOrder = async (
  payload: Omit<TOrder, '_id' | 'createdAt' | 'updatedAt' | 'clientId'> & { clientId: string },
) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateOrder = async (id: string, payload: Partial<TOrder>) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateMilestone = async (orderId: string, milestoneId: string, done: boolean) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/orders/${orderId}/milestones/${milestoneId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done }),
      },
    );
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const addOrderNote = async (orderId: string, content: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders/${orderId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const deleteOrderNote = async (orderId: string, noteIndex: number) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders/${orderId}/notes/${noteIndex}`, {
      method: 'DELETE',
    });
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const deleteOrder = async (id: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/orders/${id}`, {
      method: 'DELETE',
    });
    revalidateTag('Orders', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};
