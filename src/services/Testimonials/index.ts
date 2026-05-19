'use server';

import { revalidateTag } from 'next/cache';
import { TTestimonial } from '@/types/testimonial';

export const getAllTestimonials = async (featuredOnly = false) => {
  const q = featuredOnly ? '?featured=true' : '';
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/testimonials${q}`,
      { next: { tags: ['Testimonials'] } },
    );
    return await res.json();
  } catch {
    return { data: [] };
  }
};

export const createTestimonial = async (
  payload: Omit<TTestimonial, '_id' | 'createdAt' | 'updatedAt'>,
) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    revalidateTag('Testimonials', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const updateTestimonial = async (id: string, payload: Partial<TTestimonial>) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/testimonials/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    revalidateTag('Testimonials', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};

export const deleteTestimonial = async (id: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/testimonials/${id}`,
      { method: 'DELETE' },
    );
    revalidateTag('Testimonials', "");
    return await res.json();
  } catch (e: unknown) {
    return { success: false, message: (e as Error).message };
  }
};
