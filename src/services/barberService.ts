import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Barber } from "@/types/barbers";

const COLLECTION_NAME = "barbers";

export const barberService = {
  async getBarber(barberId: string): Promise<Barber | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, barberId);
      const docSnap = await getDoc(docRef);

      return docSnap.data() as Barber | null;
    } catch (error) {
      console.error("Erro ao buscar barbeiro:", error);
      throw new Error("Erro ao carregar barbeiro. Tente novamente.");
    }
  },
};
