"use server";

import { appointmentsTable } from "@/db/schema";
import { updateAppointmentSchema } from "./schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";

export const updateAppointment = actionClient
  .schema(updateAppointmentSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session?.user) {
        return { error: "Unauthorized" };
      }
      if (!session?.user.clinic) {
        return { error: "Clínica não encontrada" };
      }

      const updateData: {
        petId?: string;
        doctorId?: string;
        date?: string;
        time?: string;
      } = {};

      if (parsedInput.petId) {
        updateData.petId = parsedInput.petId;
      }
      if (parsedInput.doctorId) {
        updateData.doctorId = parsedInput.doctorId;
      }
      if (parsedInput.date) {
        updateData.date = parsedInput.date;
      }
      if (parsedInput.time !== undefined) {
        updateData.time = parsedInput.time;
      }

      const clinicId = session.user.clinic.id;

      if (updateData.time && updateData.doctorId && updateData.date) {
        const existingAppointment = await db.query.appointmentsTable.findFirst({
          where: and(
            eq(appointmentsTable.doctorId, updateData.doctorId),
            eq(appointmentsTable.date, updateData.date),
            eq(appointmentsTable.time, updateData.time),
            eq(appointmentsTable.clinicId, clinicId)
          ),
        });

        if (existingAppointment && existingAppointment.id !== parsedInput.id) {
          return {
            error: "Este horário já está ocupado para este médico nesta data.",
          };
        }
      } else if (updateData.time) {
        const currentAppointment = await db.query.appointmentsTable.findFirst({
          where: eq(appointmentsTable.id, parsedInput.id),
        });

        if (currentAppointment) {
          const existingAppointment = await db.query.appointmentsTable.findFirst(
            {
              where: and(
                eq(appointmentsTable.doctorId, currentAppointment.doctorId),
                eq(appointmentsTable.date, currentAppointment.date),
                eq(appointmentsTable.time, updateData.time),
                eq(appointmentsTable.clinicId, clinicId)
              ),
            }
          );

          if (existingAppointment && existingAppointment.id !== parsedInput.id) {
            return {
              error: "Este horário já está ocupado para este médico nesta data.",
            };
          }
        }
      }

      await db
        .update(appointmentsTable)
        .set(updateData)
        .where(eq(appointmentsTable.id, parsedInput.id));

      revalidatePath("/agendamentos");

      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar agendamento:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar agendamento. Verifique os dados e tente novamente.",
      };
    }
  });

