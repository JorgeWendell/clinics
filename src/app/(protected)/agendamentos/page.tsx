import {
  PageContainer,
  PageHeaderContent,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  PageActions,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AddAppointmentButton from "./componentes/add-appointment-button";
import { petsTable, doctorsTable, appointmentsTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import AppointmentsTable from "./componentes/appointments-table";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const pets = await db.query.petsTable.findMany({
    where: eq(petsTable.clinicId, session.user.clinic.id),
    with: {
      tutor: true,
    },
  });

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  const appointments = await db.query.appointmentsTable.findMany({
    where: eq(appointmentsTable.clinicId, session.user.clinic.id),
    with: {
      pet: {
        with: {
          tutor: true,
        },
      },
      doctor: true,
    },
  });

  return (
    <div>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Agendamentos</PageTitle>
            <PageDescription>
              Gerencie os agendamentos da sua clínica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddAppointmentButton pets={pets} doctors={doctors} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <AppointmentsTable
            appointments={appointments}
            pets={pets}
            doctors={doctors}
          />
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default AppointmentsPage;
