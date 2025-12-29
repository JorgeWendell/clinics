import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ClinicForm from "./components/form";


const ClinicFormPage = () => {
  
  return (
    <div>
      <Dialog open>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Clínica</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para cadastrar sua clínica.
            </DialogDescription>
          </DialogHeader>
          <ClinicForm />

          
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicFormPage;
