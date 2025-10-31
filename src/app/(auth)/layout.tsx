"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/barber");
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
