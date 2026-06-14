"use client";

import { useQuery, useMutation, useQueryClient } from "@/lib/react-query-custom";
import { fetchAllUsers, deleteUser, resolveProfileImageUrl } from "@/lib/api";
import { formatRelativeTime } from "@/lib/timeUtils";
import {
  Users,
  Plus,
  Search,
  Mail,
  ShieldCheck,
  Trash2,
  Loader2,
  Power
} from "lucide-react";
import { useState, useEffect } from "react";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { InviteUserModal } from "@/components/admin/InviteUserModal";
import { motion, AnimatePresence } from "framer-motion";

// =========================
// USER TYPE
// =========================

interface User {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  imageUrl?: string | null;
  isOnline?: boolean;
  isActive?: boolean;
  lastSeen?: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();

  // =========================
  // STATES
  // =========================

  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [toast, setToast] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem("userId");
    if (id) setCurrentUserId(Number(id));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const markImageBroken = (userId: number) => {
    setBrokenImages((prev) => new Set(prev).add(userId));
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
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

  const filteredUsers: User[] =
    users?.filter(
      (u: User) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
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

        <button
          onClick={() => setInviteOpen(true)}
          className="h-11 px-5 rounded-2xl btn-gradient text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={16} />
          Invite User
        </button>

      </div>

      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}

      <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 h-12 shadow-sm">

        <Search size={16} className="text-muted-foreground" />

        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />

      </div>

      {/* ========================= */}
      {/* LOADING */}
      {/* ========================= */}

      {isLoading ? (

        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={30} className="animate-spin text-primary" />
        </div>

      ) : filteredUsers.length === 0 ? (

        // =========================
        // EMPTY STATE
        // =========================

        <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/10">

          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Users size={30} className="text-primary" />
          </div>

          <div className="text-center">
            <h2 className="font-bold text-lg">No users found</h2>
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

            {filteredUsers.map((user: User) => (

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

                  {/* AVATAR — FIX: initials always render as base layer; image overlays on top */}
                  <div className="relative shrink-0">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-black">
                      {/* Initials always present as base — visible if image missing or broken */}
                      <span className="select-none">
                        {user.username.charAt(0).toUpperCase()}
                      </span>

                      {/* Image overlays on top; onError marks it broken via state (no DOM removal) */}
                      {user.imageUrl && !brokenImages.has(user.id) && (
                        <img
                          src={resolveProfileImageUrl(user.imageUrl) ?? ""}
                          alt={user.username}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={() => markImageBroken(user.id)}
                        />
                      )}
                    </div>

                    {/* Status dot */}
                    <div
                      className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-[3px] border-card z-10 ${
                        user.isOnline ? "bg-emerald-500" : "bg-gray-400"
                      }`}
                    >
                      {user.isOnline && (
                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                      )}
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">

                    <h2 className="font-black text-base truncate">
                      {user.username}
                    </h2>

                    <div className="mt-1 flex flex-col gap-1 items-start">

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-purple-500/10 text-purple-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {user.role}
                      </span>

                      <span
                        className={`text-[10px] font-medium mt-1 ${
                          user.isOnline ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      >
                        {formatRelativeTime(user.lastSeen, user.isOnline)}
                      </span>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-1">

                    {/* SUSPEND — disabled for self */}
                    <button
                      onClick={() => {
                        if (user.id === currentUserId) return;
                        showToast(
                          user.isActive === false
                            ? "Account restored"
                            : "Account suspended"
                        );
                      }}
                      disabled={user.id === currentUserId}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        user.id === currentUserId
                          ? "cursor-not-allowed opacity-30 text-slate-300"
                          : user.isActive === false
                          ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                          : "text-slate-400 hover:text-amber-500 hover:bg-amber-500/10"
                      }`}
                      title={
                        user.id === currentUserId
                          ? "You can't suspend yourself"
                          : user.isActive === false
                          ? "Restore Account"
                          : "Suspend Account"
                      }
                    >
                      <Power size={14} />
                    </button>

                    {/* DELETE — disabled for self */}
                    <button
                      onClick={() => {
                        if (user.id === currentUserId) return;
                        setDeleteTarget(user);
                      }}
                      disabled={user.id === currentUserId}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        user.id === currentUserId
                          ? "cursor-not-allowed opacity-30 text-slate-200"
                          : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                      }`}
                      title={
                        user.id === currentUserId
                          ? "You can't delete your own account"
                          : "Delete User"
                      }
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </div>

                {/* DETAILS */}
                <div className="mt-5 pt-5 border-t border-border/60 space-y-3">

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck size={14} />
                    <span>Verified</span>
                  </div>

                </div>

              </motion.div>

            ))}

          </AnimatePresence>

        </div>

      )}

      {/* ========================= */}
      {/* DELETE DIALOG */}
      {/* ========================= */}

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          // Prevent closing mid-mutation
          if (!open && !deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMutation.mutateAsync(deleteTarget.id);
          showToast(`${deleteTarget.username} has been removed.`);
        }}
        isLoading={deleteMutation.isPending}
        title="Delete User"
        description={`Are you sure you want to permanently remove ${deleteTarget?.username}? This action cannot be undone.`}
      />

      {/* ========================= */}
      {/* INVITE MODAL */}
      {/* ========================= */}

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      {/* ========================= */}
      {/* TOAST */}
      {/* ========================= */}

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-full text-sm font-bold shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}