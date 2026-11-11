export type WaitlistInput = {
  name: string;
  email: string;
  role: string;
  note: string | null;
};

export type WaitlistRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  note: string | null;
  createdAt: Date;
};
