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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Adicionar Pet
        </Button>
      </DialogTrigger>
      <UpsertPetForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default AddPetButton;

