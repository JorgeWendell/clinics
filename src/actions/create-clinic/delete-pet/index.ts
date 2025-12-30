"use server";
import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import z from "zod";
import { petsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const deletePet = actionClient
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
    const pet = await db.query.petsTable.findFirst({
      where: eq(petsTable.id, parsedInput.id),
    });
    if (!pet) {
      return { error: "Pet não encontrado" };
    }
    if (pet.clinicId !== session.user.clinic.id) {
      return { error: "Pet não encontrado" };
    }

    await db.delete(petsTable).where(eq(petsTable.id, parsedInput.id));
    revalidatePath("/pets");
    return { message: "Pet deletado com sucesso" };
  });

