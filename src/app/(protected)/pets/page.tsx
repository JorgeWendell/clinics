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
import AddPetButton from "./componentes/add-pet-button";
import { petsTable } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import PetsTable from "./componentes/pets-table";

const PetsPage = async () => {
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

  return (
    <div>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pets</PageTitle>
            <PageDescription>
              Gerencie os pets da sua clínica.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddPetButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <PetsTable pets={pets} />
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default PetsPage;

