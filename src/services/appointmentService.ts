import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment } from "@/types/appointment";
import { collectionSchema } from "./collection";

export const appointmentService = {
  async getAppointmentsByBarberAndDate(
    barberId: string,
    date: Date
  ): Promise<Appointment[]> {
    try {
      // Obter início e fim do dia
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.appointments.name
        ),
        where("scheduledTime", ">=", Timestamp.fromDate(startOfDay)),
        where("scheduledTime", "<=", Timestamp.fromDate(endOfDay)),
        orderBy("scheduledTime", "asc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledTime: data.scheduledTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Appointment[];
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
  },

  async getTodayAppointments(barberId: string): Promise<Appointment[]> {
    const today = new Date();
    return this.getAppointmentsByBarberAndDate(barberId, today);
  },

  async getAppointmentsByBarberAndDateRange(
    barberId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Appointment[]> {
    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.appointments.name
        ),
        where("scheduledTime", ">=", Timestamp.fromDate(start)),
        where("scheduledTime", "<=", Timestamp.fromDate(end)),
        orderBy("scheduledTime", "asc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          scheduledTime: data.scheduledTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      }) as Appointment[];
    } catch (error) {
      console.error("Erro ao buscar agendamentos por período:", error);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
  },

  async getWeekAppointments(barberId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.getAppointmentsByBarberAndDateRange(
      barberId,
      startOfWeek,
      endOfWeek
    );
  },

  async getMonthAppointments(barberId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return this.getAppointmentsByBarberAndDateRange(
      barberId,
      startOfMonth,
      endOfMonth
    );
  },

  async getAppointmentStats(barberId: string) {
    try {
      const [todayAppointments, weekAppointments, monthAppointments] =
        await Promise.all([
          this.getTodayAppointments(barberId),
          this.getWeekAppointments(barberId),
          this.getMonthAppointments(barberId),
        ]);

      return {
        today: todayAppointments.length,
        week: weekAppointments.length,
        month: monthAppointments.length,
        todayAppointments,
        weekAppointments,
        monthAppointments,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas de agendamentos:", error);
      throw new Error("Erro ao carregar estatísticas. Tente novamente.");
    }
  },
};
