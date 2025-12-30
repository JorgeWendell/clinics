"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { petsTable } from "@/db/schema";
import { PencilIcon } from "lucide-react";
import UpsertPetForm from "./upsert-pet-form";
import { useState } from "react";

interface PetCardProps {
  pet: typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
}

const PetCard = ({ pet }: PetCardProps) => {
  const [isUpsertPetDialogOpen, setIsUpsertPetDialogOpen] = useState(false);
  const petInitials = pet.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{petInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">{pet.name}</h3>
            <p className="text-muted-foreground text-xs">{pet.race}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 pt-4">
        <Badge variant="outline">{pet.type}</Badge>
        <Badge variant="outline">{pet.sex}</Badge>
        {pet.tutor && (
          <div className="text-sm">
            <p className="text-muted-foreground">Tutor:</p>
            <p className="font-medium">{pet.tutor.name}</p>
            <p className="text-muted-foreground text-xs">{pet.tutor.email}</p>
            <p className="text-muted-foreground text-xs">{pet.tutor.phone}</p>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter>
        <Dialog
          open={isUpsertPetDialogOpen}
          onOpenChange={setIsUpsertPetDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">
              <PencilIcon className="mr-1" />
              Ver Detalhes
            </Button>
          </DialogTrigger>
          <UpsertPetForm
            pet={pet}
            onSuccess={() => setIsUpsertPetDialogOpen(false)}
          />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default PetCard;

