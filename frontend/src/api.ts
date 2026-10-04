import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finance_tracker_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const messageOf = (e: unknown) => {
  const x = e as any;
  return (
    x?.response?.data?.message ||
    (x?.request ? "Unable to reach the API." : "Something went wrong.")
  );
};
export type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  profilePicture?: string | null;
};
export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};
export type Summary = {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: { category: string; total: number }[];
};
