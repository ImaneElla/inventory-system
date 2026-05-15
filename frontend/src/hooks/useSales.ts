
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      const res = await axios.get<Sale[]>(
        "http://localhost:8080/api/sales"
      );

      return res.data;
    },
  });
};