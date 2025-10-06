import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  collectionGroup,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Client, CreateClientData } from "@/types/client";
import { collectionSchema } from "./collection";

export const clientService = {
  async createClient(
    barberId: string,
    data: CreateClientData
  ): Promise<string> {
    try {
      const clientData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.clients.name
        ),
        clientData
      );
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw new Error("Erro ao criar cliente. Tente novamente.");
    }
  },

  async getClients(barberId: string): Promise<Client[]> {
    try {
      const q = query(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.clients.name
        ),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Client[];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw new Error("Erro ao carregar clientes. Tente novamente.");
    }
  },

  async getClientById(
    barberId: string,
    clientId: string
  ): Promise<Client | null> {
    try {
      const clientRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.clients.name,
        clientId
      );
      const clientDoc = await getDoc(clientRef);

      if (!clientDoc.exists()) {
        return null;
      }

      const data = clientDoc.data();
      return {
        id: clientDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Client;
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      throw new Error("Erro ao carregar cliente. Tente novamente.");
    }
  },

  async updateClient(
    barberId: string,
    id: string,
    data: Partial<CreateClientData>
  ): Promise<void> {
    try {
      const clientRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.clients.name,
        id
      );
      await updateDoc(clientRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error("Erro ao atualizar cliente. Tente novamente.");
    }
  },

  async deleteClient(barberId: string, id: string): Promise<void> {
    try {
      const clientRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.clients.name,
        id
      );
      await deleteDoc(clientRef);
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
      throw new Error("Erro ao deletar cliente. Tente novamente.");
    }
  },
};
