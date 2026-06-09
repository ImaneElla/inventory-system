"use client";

import { useQuery, useMutation, useQueryClient } from "@/lib/react-query-custom";
import { fetchAllUsers, deleteUser, resolveProfileImageUrl } from "@/lib/api";
import {
  Users,
  Plus,
  Search,
  Mail,
  ShieldCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
  const queryClient = useQueryClient();

  // =========================
  // STATES
  // =========================

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [toast, setToast] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setCurrentUserId(Number(id));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // =========================
  // FETCH USERS
  // =========================

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchAllUsers,
  });

  // =========================
  // DELETE USER
  // =========================

  const deleteMutation = useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      setDeleteTarget(null);
    },

    onError: (error: Error) => {
      showToast(error.message || "Failed to delete user");
      setDeleteTarget(null);
    },
  });

  // =========================
  // FILTER USERS
  // =========================

  const filteredUsers =
    users?.filter(
      (u: any) =>
        u.username
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        u.email
          .toLowerCase()
          .includes(search.toLowerCase())
    ) || [];

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-hidden">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Users
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and permissions
          </p>
        </div>

        <button className="h-11 px-5 rounded-2xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          <Plus size={16} />
          Invite User
        </button>

      </div>

      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}

      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 h-12 shadow-sm">

        <Search
          size={16}
          className="text-muted-foreground"
        />

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="flex-1 bg-transparent outline-none text-sm"
        />

      </div>

      {/* ========================= */}
      {/* LOADING */}
      {/* ========================= */}

      {isLoading ? (

        <div className="flex-1 flex items-center justify-center">

          <Loader2
            size={30}
            className="animate-spin text-primary"
          />

        </div>

      ) : filteredUsers.length === 0 ? (

        // =========================
        // EMPTY STATE
        // =========================

        <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/10">

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users
              size={30}
              className="text-primary"
            />
          </div>

          <div className="text-center">
            <h2 className="font-bold text-lg">
              No users found
            </h2>

            <p className="text-sm text-muted-foreground mt-1">
              Try changing your search query
            </p>
          </div>

        </div>

      ) : (

        // =========================
        // USERS GRID
        // =========================

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto pb-20">

          <AnimatePresence>

            {filteredUsers.map((user: any) => (

              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-card border border-border rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all"
              >

                {/* TOP */}
                <div className="flex items-start gap-4">

                  {/* AVATAR */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-black shrink-0">

                    {/* Initial fallback — only shown when there's no imageUrl */}
                    {!user.imageUrl && (
                      <span>
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}

                    {user.imageUrl && (
                      <img
                        src={resolveProfileImageUrl(user.imageUrl) ?? ""}
                        alt={user.username}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).remove();
                        }}
                      />
                    )}

                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">

                    <h2 className="font-black text-base truncate">
                      {user.username}
                    </h2>

                    <div className="mt-2">

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {user.role}
                      </span>

                    </div>

                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() =>
                      setDeleteTarget(user)
                    }
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >

                    <Trash2 size={16} />

                  </button>

                </div>

                {/* DETAILS */}
                <div className="mt-5 pt-5 border-t border-border/60 space-y-3">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <Mail size={14} />

                    <span className="truncate">
                      {user.email}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">

                    <ShieldCheck size={14} />

                    <span>
                      User ID: #{user.id}
                    </span>

                  </div>

                </div>

              </motion.div>

            ))}

          </AnimatePresence>

        </div>

      )}

      {/* DELETE DIALOG */}
      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;

          await deleteMutation.mutateAsync(
            deleteTarget.id
          );
        }}
        title="Delete User"
        description={`Are you sure you want to permanently remove ${deleteTarget?.username}?`}
      />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full text-sm font-bold shadow-xl">
          {toast}
        </div>
      )}

    </div>
  );
}