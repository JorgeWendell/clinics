"use server";
import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import z from "zod";
import { doctorsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const deleteDoctor = actionClient
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { error: "Unauthorized" };
    }
    if (!session?.user.clinic) {
      return { error: "Clínica não encontrada" };
    }
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, parsedInput.id),
    });
    if (!doctor) {
      return { error: "Médico não encontrado" };
    }
    if (doctor.clinicId !== session.user.clinic.id) {
      return { error: "Médico não encontrado" };
    }

    await db.delete(doctorsTable).where(eq(doctorsTable.id, parsedInput.id));
    revalidatePath("/doctors");
    return { message: "Médico deletado com sucesso" };
  });
