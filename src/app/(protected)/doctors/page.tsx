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
import { PlusIcon } from "lucide-react";

const DoctorsPage = () => {
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
