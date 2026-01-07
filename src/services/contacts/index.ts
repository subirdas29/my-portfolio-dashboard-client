/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { revalidateTag } from "next/cache";

  // get all Contacts
export const getAllContacts = async (params: Record<string, string | undefined>) => {
  const queryString = new URLSearchParams(params as any).toString();
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/messages?${queryString}`, {
      next: { tags: ["Contact"] },
    });
    return await res.json();
  } catch (error: any) {
    return { success: false, data: [], meta: { total: 0, page: 1, limit: 10 } };
  }
};
  // update Contact Status
export const updateContactStatus = async (
  contactId: string,
  status: string
): Promise<any> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API}/messages/${contactId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Authorization: (await cookies()).get("accessToken")?.value || "",
        },
        body: JSON.stringify({ status }),
      }
    );

  
    revalidateTag("Contact");
    
    return await res.json();
  } catch (error: any) {
    return Error(error.message);
  }
};


    // delete Contact
  export const deleteContact = async (
      contactId: string
    ): Promise<any> => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/messages/${contactId}`,
          {
            method: "Delete",
          
            headers: {
              // Authorization: (await cookies()).get("accessToken")!.value,
              "Content-Type": "application/json",
            },
            
          }
        );
        revalidateTag("Contact");
        return await res.json();
      } catch (error: any) {
        return Error(error);
      }
    };