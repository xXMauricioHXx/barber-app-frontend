import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
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

      await addDoc(
        collection(
          db,
          collectionSchema.clients.name,
          data.clientId,
          collectionSchema.clients.subCollections.appointments.name
        ),
        {
          ...appointmentData,
          id: docRef.id,
        }
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

  async getAppointmentsByEmployeeAndDate(
    barberId: string,
    employeeId: string,
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
        where("selectedBarber.id", "==", employeeId),
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
      console.error("Erro ao buscar agendamentos por funcionário:", error);
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

  async getAllAppointmentsByBarber(barberId: string): Promise<Appointment[]> {
    try {
      const q = query(
        collection(
          db,
          collectionSchema.barbers.name,
          barberId,
          collectionSchema.barbers.subCollections.appointments.name
        ),
        orderBy("scheduledTime", "desc")
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
      console.error("Erro ao buscar todos os agendamentos:", error);
      throw new Error("Erro ao carregar agendamentos. Tente novamente.");
    }
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

  async updateAppointmentStatus(
    barberId: string,
    appointmentId: string,
    clientId: string,
    newStatus: "Agendado" | "Confirmado" | "Concluído" | "Cancelado"
  ): Promise<void> {
    try {
      const now = new Date();

      // Atualizar no subcoleção do barbeiro
      const barberAppointmentRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.appointments.name,
        appointmentId
      );

      await updateDoc(barberAppointmentRef, {
        status: newStatus,
        updatedAt: now,
      });

      // Buscar agendamento na subcoleção do cliente para obter o ID correto
      const clientAppointmentsQuery = query(
        collection(
          db,
          collectionSchema.clients.name,
          clientId,
          collectionSchema.clients.subCollections.appointments.name
        ),
        where("id", "==", appointmentId)
      );

      const clientAppointmentsSnapshot = await getDocs(clientAppointmentsQuery);

      if (!clientAppointmentsSnapshot.empty) {
        const clientAppointmentDoc = clientAppointmentsSnapshot.docs[0];
        await updateDoc(clientAppointmentDoc.ref, {
          status: newStatus,
          updatedAt: now,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento:", error);
      throw new Error("Erro ao atualizar status. Tente novamente.");
    }
  },

  async cancelAppointment(
    barberId: string,
    appointmentId: string,
    clientId: string
  ): Promise<void> {
    return this.updateAppointmentStatus(
      barberId,
      appointmentId,
      clientId,
      "Cancelado"
    );
  },

  async confirmAppointment(
    barberId: string,
    appointmentId: string,
    clientId: string
  ): Promise<void> {
    return this.updateAppointmentStatus(
      barberId,
      appointmentId,
      clientId,
      "Confirmado"
    );
  },

  async getAppointmentById(
    barberId: string,
    appointmentId: string
  ): Promise<Appointment | null> {
    try {
      const appointmentRef = doc(
        db,
        collectionSchema.barbers.name,
        barberId,
        collectionSchema.barbers.subCollections.appointments.name,
        appointmentId
      );

      const appointmentSnap = await getDoc(appointmentRef);

      if (!appointmentSnap.exists()) {
        return null;
      }

      const data = appointmentSnap.data();
      return {
        id: appointmentSnap.id,
        ...data,
        scheduledTime: data.scheduledTime?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Appointment;
    } catch (error) {
      console.error("Erro ao buscar agendamento:", error);
      throw new Error("Erro ao carregar agendamento. Tente novamente.");
    }
  },

  async cancelAppointmentByClient(
    barberId: string,
    appointmentId: string,
    clientId: string
  ): Promise<void> {
    try {
      // Verificar se o agendamento ainda pode ser cancelado
      const appointment = await this.getAppointmentById(
        barberId,
        appointmentId
      );

      if (!appointment) {
        throw new Error("Agendamento não encontrado");
      }

      if (appointment.clientId !== clientId) {
        throw new Error(
          "Você não tem permissão para cancelar este agendamento"
        );
      }

      if (!["Agendado", "Confirmado"].includes(appointment.status)) {
        throw new Error("Este agendamento não pode mais ser cancelado");
      }

      // Verificar se não é muito próximo do horário (ex: menos de 2 horas)
      const now = new Date();
      const appointmentTime = appointment.scheduledTime;
      const hoursDifference =
        (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDifference < 2) {
        throw new Error(
          "Não é possível cancelar agendamentos com menos de 2 horas de antecedência"
        );
      }

      return this.updateAppointmentStatus(
        barberId,
        appointmentId,
        clientId,
        "Cancelado"
      );
    } catch (error) {
      console.error("Erro ao cancelar agendamento pelo cliente:", error);
      throw error;
    }
  },
};
