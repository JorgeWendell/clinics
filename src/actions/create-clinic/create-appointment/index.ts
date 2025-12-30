"use server";

import { appointmentsTable } from "@/db/schema";
import { createAppointmentSchema } from "./schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
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

      const clinicId = session.user.clinic.id;
      
      // A data vem como string no formato ISO (YYYY-MM-DD)
      // O Drizzle aceita strings no formato ISO para o tipo date do PostgreSQL
      await db.insert(appointmentsTable).values({
        id: randomUUID(),
        date: parsedInput.date,
        time: parsedInput.time,
        petId: parsedInput.petId,
        doctorId: parsedInput.doctorId,
        clinicId,
      });
      
      revalidatePath("/agendamentos");
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar agendamento. Verifique os dados e tente novamente.",
      };
    }
  });

