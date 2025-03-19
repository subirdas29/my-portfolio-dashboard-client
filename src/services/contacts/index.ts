"use server"

import { revalidateTag } from "next/cache";

  // get all Contacts
  export const getAllContacts = async (page?: string,limit?:string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/messages?limit=${limit}&page=${page}`,
        {
          next: {
            tags: ["Contact"],
          },
        }
      );
      const data = await res.json();
      return data;
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