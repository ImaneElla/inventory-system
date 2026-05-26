
import { useQuery } from "@/lib/react-query-custom";
import { fetchSales } from "@/lib/api";

export interface Sale {
  id: number;
  transactionId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const useSales = () => {
  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      const res = await fetchSales();
      return res.content as Sale[];
    },
  });
};