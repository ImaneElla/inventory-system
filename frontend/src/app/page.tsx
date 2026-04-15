import { redirect } from "next/navigation";

export default function Home() {
  // Completely removes the default Next.js starter layout
  // Instantly redirects all root traffic straight to login
  redirect("/login");
}
