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
import { appointmentsTable, doctorsTable, petsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addMonths, format } from "date-fns";
import { DatePicker } from "./components/date-picker";
import { StatsCards } from "./components/stats-cards";
import dayjs from "dayjs";
import AppointmentsChart from "./components/revenue-chart";

import DoctorsList from "./components/top-doctors";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formarCurrencyInCents } from "@/helpers/currency";
import { ptBR } from "date-fns/locale/pt-BR";

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
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const fromDateValue = from ? new Date(from) : new Date();
  const toDateValue = to ? new Date(to) : addMonths(new Date(), 1);

  const fromDate = format(fromDateValue, "yyyy-MM-dd");
  const toDate = format(toDateValue, "yyyy-MM-dd");

  const [
    [totalRevenue],
    [totalAppointments],
    [totalPets],
    [totalDoctors],
    topDoctors,
    todayAppointments,
  ] = await Promise.all([
    db
      .select({
        total: sum(doctorsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
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
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        speciality: doctorsTable.speciality,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      )
      .where(eq(doctorsTable.clinicId, session.user.clinic.id))
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(appointmentsTable.date, fromDate),
        lte(appointmentsTable.date, toDate),
      ),
      with: {
        pet: {
          with: {
            tutor: true,
          },
        },
        doctor: true,
      },
    }),
  ]);

  const chartStatsDate = format(
    dayjs().subtract(10, "days").startOf("day").toDate(),
    "yyyy-MM-dd",
  );
  const chartEndDate = format(
    dayjs().add(10, "days").endOf("day").toDate(),
    "yyyy-MM-dd",
  );

  const dailyAppointmentData = await db
    .select({
      date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
      appointments: count(appointmentsTable.id),
      revenue:
        sql<number>`COALESCE(SUM(${doctorsTable.appointmentPriceInCents}), 0)`.as(
          "revenue",
        ),
    })
    .from(appointmentsTable)
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(
      and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(appointmentsTable.date, chartStatsDate),
        lte(appointmentsTable.date, chartEndDate),
      ),
    )
    .groupBy(sql`DATE(${appointmentsTable.date})`)
    .orderBy(sql`DATE(${appointmentsTable.date})`);

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const todayAppointmentsFiltered = todayAppointments.filter(
    (appointment) => appointment.date === todayDate,
  );

  const formatDate = (dateString: string | Date, time?: string | null) => {
    let date: Date;
    if (typeof dateString === "string") {
      const [year, month, day] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = dateString;
    }
    const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
    if (time) {
      const [hour, minute] = time.split(":");
      return `${formattedDate} ${hour}:${minute}`;
    }
    return formattedDate;
  };

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
        <div className="grid grid-cols-[2.25fr_1fr] gap-6">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentData} />
          <DoctorsList doctors={topDoctors} />
        </div>
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground" />
                <CardTitle className="text-base">
                  Agendamentos de hoje
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointmentsFiltered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground h-24 text-center"
                      >
                        Nenhum agendamento para hoje
                      </TableCell>
                    </TableRow>
                  ) : (
                    todayAppointmentsFiltered.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{appointment.pet?.name || "-"}</TableCell>
                        <TableCell>
                          {appointment.pet?.tutor?.name || "-"}
                        </TableCell>
                        <TableCell>{appointment.doctor?.name || "-"}</TableCell>
                        <TableCell>
                          {formatDate(appointment.date, appointment.time)}
                        </TableCell>
                        <TableCell>
                          {appointment.doctor?.appointmentPriceInCents
                            ? formarCurrencyInCents(
                                appointment.doctor.appointmentPriceInCents,
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
