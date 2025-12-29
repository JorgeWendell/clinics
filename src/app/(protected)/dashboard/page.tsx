import { db } from "@/db";
import {  userToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  const clinics = await db.query.userToClinicsTable.findMany({
    where: eq(userToClinicsTable.userId, session.user.id),
  });
  if (clinics.length === 0) {
    redirect("/clinic-form");
  }
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
