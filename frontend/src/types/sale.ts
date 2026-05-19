export interface SaleItem {
  id: number;
  quantity: number;
  price?: number;
  unitPrice?: number;
  productId: number;
  productName: string;
}

export interface Sale {
  id: number;
  transactionId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: SaleItem[];
  clientName?: string;
  paymentMethod?: string;
  discountApplied?: number;
  amountTendered?: number;
}