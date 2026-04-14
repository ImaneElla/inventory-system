"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn, Loader2, Box } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // call login api from backend
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.text();

      if (response.status === 200) {
        // show success alert
        Swal.fire({
          icon: 'success',
          title: 'Welcome!',
          text: 'Login successful',
          timer: 1500,
          showConfirmButton: false
        });
      } else if (response.status === 404 || data.toLowerCase().includes("not found")) {
        // user not found alert with register option
        Swal.fire({
          title: 'User Not Found',
          text: "You don't have an account. Register now?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#2563eb',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, Register',
          cancelButtonText: 'Try again'
        }).then((result) => {
          if (result.isConfirmed) {
            // go to register page
            router.push('/register');
          }
        });
      } else {
        // show error for wrong password
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data,
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // server is offline
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Backend is not running!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        
        {/* header blue section */}
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
             <Box size={32} /> 
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-blue-100 mt-1 opacity-90">Inventory Management System</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* username field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* password field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                   <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-gray-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* login button with loading spinner */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* link to register page */}
          <div className="mt-8 text-center text-sm text-gray-500">
            New here? <a href="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}