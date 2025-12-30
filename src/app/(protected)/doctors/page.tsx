import { Button } from "@/components/ui/button";
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
import { PlusIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AddDoctorButton from "./componentes/add-doctor-button";
import { doctorsTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import DoctorCard from "./componentes/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });
  return (
    <div>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Médicos</PageTitle>
            <PageDescription>
              Gerencie os médicos da sua clínica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddDoctorButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default DoctorsPage;
