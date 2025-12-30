"use server";

import { appointmentsTable } from "@/db/schema";
import { updateAppointmentSchema } from "./schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
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

