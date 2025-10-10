import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { collectionSchema } from "./collection";
import { Employee } from "@/types/employee";

export const employeeService = {
  async getEmployees(barberId: string): Promise<Employee[]> {
    try {
      const q = query(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.employees.name
        ),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Employee[];
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      throw new Error("Erro ao carregar colaboradores. Tente novamente.");
    }
  },

  async createEmployee(
    barberId: string,
    employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">
  ): Promise<void> {
    try {
      await addDoc(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.employees.name
        ),
        {
          ...employeeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("Erro ao criar colaborador:", error);
      throw new Error("Erro ao criar colaborador. Tente novamente.");
    }
  },

  async updateEmployee(
    barberId: string,
    employeeId: string,
    employeeData: Partial<Omit<Employee, "id" | "createdAt" | "updatedAt">>
  ): Promise<void> {
    try {
      const employeeRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.employees.name,
        employeeId
      );
      await updateDoc(employeeRef, {
        ...employeeData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar colaborador:", error);
      throw new Error("Erro ao atualizar colaborador. Tente novamente.");
    }
  },

  async getEmployeeById(
    barberId: string,
    employeeId: string
  ): Promise<Employee | null> {
    try {
      const employeeRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.employees.name,
        employeeId
      );
      const employeeSnap = await getDoc(employeeRef);

      if (!employeeSnap.exists()) {
        return null;
      }

      return {
        id: employeeSnap.id,
        ...employeeSnap.data(),
        createdAt: employeeSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: employeeSnap.data().updatedAt?.toDate() || new Date(),
      } as Employee;
    } catch (error) {
      console.error("Erro ao buscar colaborador:", error);
      throw new Error("Erro ao carregar colaborador. Tente novamente.");
    }
  },

  async deleteEmployee(barberId: string, employeeId: string): Promise<void> {
    try {
      const employeeRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.employees.name,
        employeeId
      );
      await deleteDoc(employeeRef);
    } catch (error) {
      console.error("Erro ao deletar colaborador:", error);
      throw new Error("Erro ao deletar colaborador. Tente novamente.");
    }
  },
};
