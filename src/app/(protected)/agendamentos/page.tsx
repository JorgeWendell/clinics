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
import { petsTable, doctorsTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

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
          {/* Listagem de agendamentos será adicionada posteriormente */}
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default AppointmentsPage;

