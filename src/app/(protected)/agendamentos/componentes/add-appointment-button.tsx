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
import UpsertAppointmentForm from "./upsert-appointment-form";
import { useState } from "react";
import { petsTable, doctorsTable } from "@/db/schema";

interface AddAppointmentButtonProps {
  pets: (typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  })[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const AddAppointmentButton = ({
  pets,
  doctors,
}: AddAppointmentButtonProps) => {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setKey((prev) => prev + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </DialogTrigger>
      {open && (
        <UpsertAppointmentForm
          key={`new-appointment-${key}`}
          pets={pets}
          doctors={doctors}
          onSuccess={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
};

export default AddAppointmentButton;

