"use client";

import { ClientAuthProvider } from "@/context/ClientAuthContext";
import ClientAuthGuard from "@/components/ClientAuthGuard";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ClientAuthProvider>
      <ClientAuthGuard>{children}</ClientAuthGuard>
    </ClientAuthProvider>
  );
}
