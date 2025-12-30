"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { upsertPet } from "@/actions/create-clinic/upsert-pet";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Loader2, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { petsTable } from "@/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { deletePet } from "@/actions/create-clinic/delete-pet";

const petFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  race: z.string().trim().min(1, { message: "Raça é obrigatória" }),
  type: z.enum(["canino", "felino", "ave", "roedor", "reptil", "outro"], {
    message: "Tipo é obrigatório",
  }),
  sex: z.enum(["Macho", "Femea"], {
    message: "Sexo é obrigatório",
  }),
  tutorName: z
    .string()
    .trim()
    .min(1, { message: "Nome do tutor é obrigatório" }),
  tutorEmail: z
    .string()
    .email({ message: "Email inválido" })
    .trim()
    .min(1, { message: "Email do tutor é obrigatório" }),
  tutorPhone: z
    .string()
    .trim()
    .min(1, { message: "Telefone do tutor é obrigatório" }),
});

interface UpsertPetFormProps {
  pet?: typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  onSuccess?: () => void;
}

const UpsertPetForm = ({ pet, onSuccess }: UpsertPetFormProps) => {
  const form = useForm<z.infer<typeof petFormSchema>>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: pet?.name || "",
      race: pet?.race || "",
      type: pet?.type || "canino",
      sex: pet?.sex || "Macho",
      tutorName: pet?.tutor?.name || "",
      tutorEmail: pet?.tutor?.email || "",
      tutorPhone: pet?.tutor?.phone || "",
    },
  });

  useEffect(() => {
    if (pet) {
      form.reset({
        name: pet.name || "",
        race: pet.race || "",
        type: pet.type || "canino",
        sex: pet.sex || "Macho",
        tutorName: pet.tutor?.name || "",
        tutorEmail: pet.tutor?.email || "",
        tutorPhone: pet.tutor?.phone || "",
      });
    } else {
      form.reset({
        name: "",
        race: "",
        type: "canino",
        sex: "Macho",
        tutorName: "",
        tutorEmail: "",
        tutorPhone: "",
      });
    }
  }, [pet, form]);

  const upsertPetAction = useAction(upsertPet, {
    onSuccess: () => {
      toast.success(
        pet ? "Pet atualizado com sucesso" : "Pet adicionado com sucesso",
      );
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      const errorMessage =
        error.serverError || error.validationErrors
          ? JSON.stringify(error)
          : pet
            ? "Erro ao atualizar pet"
            : "Erro ao adicionar pet";
      toast.error(errorMessage);
    },
  });

  const deletePetAction = useAction(deletePet, {
    onSuccess: () => {
      toast.success("Pet deletado com sucesso");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao deletar pet");
    },
  });

  const handleDeletePetClick = () => {
    if (!pet?.id) {
      return;
    }
    deletePetAction.execute({ id: pet.id });
  };

  const onSubmit = (data: z.infer<typeof petFormSchema>) => {
    upsertPetAction.execute({
      ...data,
      id: pet?.id,
      tutorId: pet?.tutor?.id,
    });
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{pet ? "Editar Pet" : "Adicionar Pet"}</DialogTitle>
        <DialogDescription>
          Preencha os campos abaixo para {pet ? "editar" : "adicionar"} um novo
          pet.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="pet" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pet">Pet</TabsTrigger>
              <TabsTrigger value="tutor">Tutor</TabsTrigger>
            </TabsList>
            <TabsContent value="pet" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="race"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raça</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="canino">Canino</SelectItem>
                        <SelectItem value="felino">Felino</SelectItem>
                        <SelectItem value="ave">Ave</SelectItem>
                        <SelectItem value="roedor">Roedor</SelectItem>
                        <SelectItem value="reptil">Réptil</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o sexo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Macho">Macho</SelectItem>
                        <SelectItem value="Femea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="tutor" className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="tutorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tutorEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tutorPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
          <DialogFooter>
            {pet && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <TrashIcon className="mr-1" /> Deletar Pet
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja deletar o pet "{pet?.name}"?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser revertida. Isso irá remover o pet
                      da clínica e todas as consultas agendadas com ele.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePetClick}>
                      {deletePetAction.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Deletar"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit" disabled={upsertPetAction.isPending}>
              {upsertPetAction.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : pet ? (
                "Editar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertPetForm;

