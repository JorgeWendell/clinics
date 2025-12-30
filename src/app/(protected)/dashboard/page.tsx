import { Button } from "@/components/ui/button";
import {
  PageActions,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContainer,
  PageContent,
  PageHeader,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  appointmentsTable,
  clinicsTable,
  doctorsTable,
  petsTable,
  userToClinicsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, count, eq, gte, lte, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addMonths, format } from "date-fns";
import { DatePicker } from "./components/date-picker";
import { StatsCards } from "./components/stats-cards";
import dayjs from "dayjs";

interface DashboardPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(`/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, 'month').format("YYYY-MM-DD")}`);
  }

  const fromDateValue = from ? new Date(from) : new Date();
  const toDateValue = to ? new Date(to) : addMonths(new Date(), 1);

  const fromDate = format(fromDateValue, "yyyy-MM-dd");
  const toDate = format(toDateValue, "yyyy-MM-dd");

  const [[totalRevenue], [totalAppointments], [totalPets], [totalDoctors]] =
    await Promise.all([
      db
        .select({
          total: sum(doctorsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .innerJoin(
          doctorsTable,
          eq(appointmentsTable.doctorId, doctorsTable.id),
        )
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, fromDate),
            lte(appointmentsTable.date, toDate),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, fromDate),
            lte(appointmentsTable.date, toDate),
          ),
        ),
      db
        .select({
          total: count(),
        })
        .from(petsTable)
        .where(and(eq(petsTable.clinicId, session.user.clinic.id))),
      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(and(eq(doctorsTable.clinicId, session.user.clinic.id))),
    ]);
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle> Dashboard </PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={
            typeof totalRevenue?.total === "string"
              ? parseInt(totalRevenue.total) || 0
              : totalRevenue?.total || 0
          }
          totalAppointments={totalAppointments?.total || 0}
          totalPets={totalPets?.total || 0}
          totalDoctors={totalDoctors?.total || 0}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
