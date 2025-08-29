export interface CollectionType {
  id: string;
  name: string;
  status: boolean;
  time: string;
}

export interface Collection {
  id: string;
  paymentGateway: "PAYAZA";
  currency: "NGN" | "USD";
  amount: number;
  collectionTypeId: string;
  collectionType: CollectionType;
  transactions: string[];
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  comment: string;
  collectionNo: string;
  collectionReference: string;
  collectionStatus: "Pending" | "Successful" | "Failed";
  customerNumber: string;
  customerBankCode: string;
  countryCode: string;
  time: string;
}

export interface Transaction {
  id: string;
  status: string;
  transactionStatus: string;
  collectionId: string;
  collection: Collection;
  type: "CHARGE";
  response: Record<string, unknown>;
  time: string;
}

export interface TransactionParams {
  pageNumber: number;
  pageSize: number;
  collectionId?: string;
  collectionNo?: string;
  transactionStatus?: string;
}

export interface TransactionResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
