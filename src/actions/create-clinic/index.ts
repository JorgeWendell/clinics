"use server";

import { db } from "@/db";
import { clinicsTable, userToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const createClinic = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { error: "Unauthorized" };
  }
  const [clinic] = await db
    .insert(clinicsTable)
    .values({ id: session.user.id, name })
    .returning();
  await db
    .insert(userToClinicsTable)
    .values({ userId: session.user.id, clinicId: clinic.id });
  redirect("/dashboard");
};
