"use server";

import { doctorsTable } from "@/db/schema";
import { upsertDoctorSchema } from "./schema";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
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

    const clinicId = session.user.clinic.id;
    const email =
      parsedInput.email ||
      `${parsedInput.name.toLowerCase().replace(/\s+/g, ".")}.${randomUUID().slice(0, 8)}@clinica.local`;

    if (parsedInput.id) {
      const { id, ...updateData } = parsedInput;
      await db
        .update(doctorsTable)
        .set({
          ...updateData,
          email,
          clinicId,
        })
        .where(eq(doctorsTable.id, id));
      revalidatePath("/doctors");
    } else {
      await db.insert(doctorsTable).values({
        ...parsedInput,
        id: randomUUID(),
        email,
        clinicId,
      });
      revalidatePath("/doctors");
    }
  });
