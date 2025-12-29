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
            <Button>
              <PlusIcon className="h-4 w-4" />
              Adicionar Médico
            </Button>
          </PageActions>
        </PageHeader>
      </PageContainer>
    </div>
  );
};

export default DoctorsPage;
