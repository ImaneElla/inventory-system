"use client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-800">
      <div className="bg-white rounded-2xl shadow-sm p-12 max-w-lg w-full text-center border border-slate-200">
        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
        <p className="text-slate-500 mb-8">
          Welcome to your secure Inventory Management portal. You have successfully authenticated!
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
