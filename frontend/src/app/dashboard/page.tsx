"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/logo/logo";

export default function Dashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Auth Guard: If no token exists, immediately kick to login
    if (localStorage.getItem("auth") !== "true") {
      router.replace("/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true);
    }
  }, [router]);

  const handleSignOut = () => {
    // Proactively destroy the session lock before bouncing
    localStorage.removeItem("auth");
    router.replace("/login");
  };

  // Prevent UI flash by returning null until auth completes
  if (!authorized) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="bg-card rounded-2xl shadow-sm p-12 max-w-lg w-full text-center border border-border">
        <Logo className="w-16 h-16 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
        <p className="text-muted-foreground mb-8">
          Welcome to your secure Inventory Management portal. You have successfully authenticated!
        </p>
        <button
          onClick={handleSignOut}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-6 rounded-lg transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
