import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { barberService } from "@/services/barberService";
import { Barber } from "@/types/barbers";

export const useBarberSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [barberData, setBarberData] = useState<Barber | null>(null);

  const loadBarberSettings = useCallback(async () => {
    if (!user?.uid) return null;

    setLoading(true);
    try {
      const barber = await barberService.getBarber(user.uid);
      setBarberData(barber);
      return barber;
    } catch (error) {
      console.error("Erro ao carregar configurações do barbeiro:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const saveBarberSettings = useCallback(
    async (settings: Omit<Barber, "id">) => {
      if (!user?.uid) throw new Error("Usuário não autenticado");

      setSaving(true);
      try {
        const existingBarber = await barberService.getBarber(user.uid);

        if (existingBarber) {
          await barberService.updateBarberSettings(user.uid, settings);
        } else {
          await barberService.createBarber(user.uid, settings);
        }

        // Atualizar dados locais
        const updatedBarber = { id: user.uid, ...settings };
        setBarberData(updatedBarber);

        return updatedBarber;
      } catch (error) {
        console.error("Erro ao salvar configurações do barbeiro:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [user?.uid]
  );

  return {
    barberData,
    loading,
    saving,
    loadBarberSettings,
    saveBarberSettings,
  };
};
