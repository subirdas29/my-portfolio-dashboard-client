export type TCertification = {
  _id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  badgeImage?: string;
  order?: number;
  createdAt?: string;
};
