import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: { absolute: "ALLMOVA Admin — Manajemen Langganan" },
  description:
    "Panel internal ALLMOVA untuk mengelola tier langganan, masa aktif Pro, sesi perangkat pengguna, rute favorit, dan pengumuman aplikasi.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminPage() {
  return <AdminPanel />;
}
