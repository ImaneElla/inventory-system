export interface SaleItem {
  id: number;
  quantity: number;
  price: number;
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
}