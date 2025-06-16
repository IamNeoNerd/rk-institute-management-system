export interface Course {
  id: string;
  name: string;
  description?: string;
  grade?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  feeStructure?: {
    id: string;
    amount: number;
    billingCycle: string;
  };
  _count: {
    subscriptions: number;
  };
  createdAt: string;
}
