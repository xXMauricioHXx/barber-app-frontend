"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange } from "@/lib/auth";
import { Client } from "@/types/client";
import { clientService } from "@/services/clientService";

interface ClientAuthContextType {
  user: User | null;
  clientData: Client | null;
  loading: boolean;
}

const ClientAuthContext = createContext<ClientAuthContextType>({
  user: null,
  clientData: null,
  loading: true,
});

export const useClientAuth = () => {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error(
      "useClientAuth deve ser usado dentro de um ClientAuthProvider"
    );
  }
  return context;
};

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

export const ClientAuthProvider = ({ children }: ClientAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);

      if (user) {
        try {
          const client = await clientService.getById(user.uid);

          if (client) {
            setClientData(client);
          } else {
            setClientData(null);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do cliente:", error);
          setClientData(null);
        }
      } else {
        setClientData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    clientData,
    loading,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
};
