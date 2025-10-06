import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { collectionSchema } from "./collection";
import { Employee } from "@/types/employee";

export const employeeService = {
  async getEmployees(barberId: string): Promise<Employee[]> {
    try {
      console.log("Fetching employees for barberId:", barberId);
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
      console.error("Erro ao buscar funcionários:", error);
      throw new Error("Erro ao carregar funcionários. Tente novamente.");
    }
  },
};
