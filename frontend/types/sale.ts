export interface SaleItem {
  id: number;
  quantity: number;
  price: number;

  product: {
    id: number;
    name: string;
  };
}

export interface Sale {
  id: number;
  transactionId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: SaleItem[];
}