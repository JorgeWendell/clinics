"use server";

import { petsTable, tutorsTable } from "@/db/schema";
import { upsertPetSchema } from "./schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";

export const upsertPet = actionClient
  .schema(upsertPetSchema)
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
      let tutorId = parsedInput.tutorId;

      if (!tutorId) {
        const newTutorId = randomUUID();
        await db.insert(tutorsTable).values({
          id: newTutorId,
          name: parsedInput.tutorName,
          email: parsedInput.tutorEmail,
          phone: parsedInput.tutorPhone,
        });
        tutorId = newTutorId;
      } else {
        await db
          .update(tutorsTable)
          .set({
            name: parsedInput.tutorName,
            email: parsedInput.tutorEmail,
            phone: parsedInput.tutorPhone,
          })
          .where(eq(tutorsTable.id, tutorId));
      }

      if (parsedInput.id) {
        await db
          .update(petsTable)
          .set({
            name: parsedInput.name,
            race: parsedInput.race,
            type: parsedInput.type,
            sex: parsedInput.sex,
            tutorId,
            clinicId,
          })
          .where(eq(petsTable.id, parsedInput.id));
        revalidatePath("/pets");
      } else {
        await db.insert(petsTable).values({
          id: randomUUID(),
          name: parsedInput.name,
          race: parsedInput.race,
          type: parsedInput.type,
          sex: parsedInput.sex,
          tutorId,
          clinicId,
        });
        revalidatePath("/pets");
      }
    } catch (error) {
      console.error("Erro ao salvar pet:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao salvar pet. Verifique os dados e tente novamente.",
      };
    }
  });

