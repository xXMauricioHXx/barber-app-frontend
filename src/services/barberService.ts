import {
  doc,
  getDoc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Barber } from "@/types/barbers";
import { collectionSchema } from "./collection";

export const barberService = {
  async getBarber(barberId: string): Promise<Barber | null> {
    try {
      const docRef = doc(db, collectionSchema.barbers.name, barberId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Barber;
    } catch (error) {
      console.error("Erro ao buscar barbeiro:", error);
      throw new Error("Erro ao carregar barbeiro. Tente novamente.");
    }
  },

  async getAllBarbers(): Promise<Barber[]> {
    try {
      const querySnapshot = await getDocs(
        collection(db, collectionSchema.barbers.name)
      );

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Barber[];
    } catch (error) {
      console.error("Erro ao buscar barbeiros:", error);
      throw new Error("Erro ao carregar barbeiros. Tente novamente.");
    }
  },

  async updateBarberSettings(
    barberId: string,
    settings: Partial<Barber>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionSchema.barbers.name, barberId);
      await updateDoc(docRef, settings);
    } catch (error) {
      console.error("Erro ao atualizar configurações do barbeiro:", error);
      throw new Error("Erro ao salvar configurações. Tente novamente.");
    }
  },

  async createBarber(
    barberId: string,
    barberData: Omit<Barber, "id">
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionSchema.barbers.name, barberId);
      await setDoc(docRef, barberData);
    } catch (error) {
      console.error("Erro ao criar barbeiro:", error);
      throw new Error("Erro ao criar barbeiro. Tente novamente.");
    }
  },
};
