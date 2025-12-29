"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import UpsertDoctorForm from "./upsert-doctor-form";

const AddDoctorButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Adicionar Médico
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm />
    </Dialog>
  );
};

export default AddDoctorButton;
