export interface Student {
  id: string;
  name: string;
  grade?: string;
  dateOfBirth?: string;
  enrollmentDate: string;
  family: {
    id: string;
    name: string;
    discountAmount: number;
  };
  subscriptions: {
    id: string;
    course?: {
      id: string;
      name: string;
      feeStructure?: {
        amount: number;
        billingCycle: string;
      };
    };
    service?: {
      id: string;
      name: string;
      feeStructure?: {
        amount: number;
        billingCycle: string;
      };
    };
    discountAmount: number;
  }[];
  _count: {
    subscriptions: number;
  };
  createdAt: string;
}
