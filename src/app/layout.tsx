import * as React from "react";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Barber App - Sistema de Gestão para Barbearias",
  description:
    "Sistema completo para gestão de barbearias: clientes, agendamentos, colaboradores e mais.",
  keywords: "barbearia, gestão, agendamento, clientes, sistema",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
