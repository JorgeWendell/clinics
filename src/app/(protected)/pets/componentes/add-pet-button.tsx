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
import UpsertPetForm from "./upsert-pet-form";
import { useState } from "react";

const AddPetButton = () => {
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
          Adicionar Pet
        </Button>
      </DialogTrigger>
      {open && (
        <UpsertPetForm
          key={`new-pet-${key}`}
          onSuccess={() => setOpen(false)}
        />
      )}
    </Dialog>
  );
};

export default AddPetButton;

