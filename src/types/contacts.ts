export type TContact = {
    _id?:string;
    name: string;
    phone:string;
    email: string;
    subject:string;
    message: string;
    status:"Pending" | "Replied" | "No Response" | "Dealing" | "Booked" | "Closed";
  createdAt?: string;
  };
  