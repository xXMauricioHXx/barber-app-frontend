import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Appointment, CreateAppointmentData } from "@/types/appointment";
import { collectionSchema } from "./collection";
import {
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
} from "@/lib/dateUtils";

export const appointmentService = {
  async createAppointment(
    barberId: string,
    data: CreateAppointmentData
  ): Promise<string> {
    try {
      const appointmentData = {
        ...data,
        barberId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.appointments.name
        ),
        appointmentData
      );
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      throw new Error("Erro ao criar agendamento. Tente novamente.");
    }
  },
  async getAppointmentsByBarberAndDate(
    barberId: string,
    date: Date
  ): Promise<Appointment[]> {
    try {
      // Usar date-fns para obter início e fim do dia
      const startOfDay = getStartOfDay(date);
      const endOfDay = getEndOfDay(date);

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
      // Usar date-fns para obter início e fim dos dias
      const start = getStartOfDay(startDate);
      const end = getEndOfDay(endDate);

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
    const startOfWeekDate = getStartOfWeek(today);
    const endOfWeekDate = getEndOfWeek(today);

    return this.getAppointmentsByBarberAndDateRange(
      barberId,
      startOfWeekDate,
      endOfWeekDate
    );
  },

  async getMonthAppointments(barberId: string): Promise<Appointment[]> {
    const today = new Date();
    const startOfMonthDate = getStartOfMonth(today);
    const endOfMonthDate = getEndOfMonth(today);

    return this.getAppointmentsByBarberAndDateRange(
      barberId,
      startOfMonthDate,
      endOfMonthDate
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
