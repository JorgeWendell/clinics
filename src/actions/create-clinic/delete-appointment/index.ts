"use server";

import { appointmentsTable } from "@/db/schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const deleteAppointmentSchema = z.object({
  id: z.string().min(1),
});

export const deleteAppointment = actionClient
  .schema(deleteAppointmentSchema)
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

      const appointment = await db.query.appointmentsTable.findFirst({
        where: eq(appointmentsTable.id, parsedInput.id),
      });

      if (!appointment) {
        return { error: "Agendamento não encontrado" };
      }

      if (appointment.clinicId !== session.user.clinic.id) {
        return { error: "Agendamento não encontrado" };
      }

      await db
        .delete(appointmentsTable)
        .where(eq(appointmentsTable.id, parsedInput.id));

      revalidatePath("/agendamentos");
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao deletar agendamento. Tente novamente.",
      };
    }
  });
