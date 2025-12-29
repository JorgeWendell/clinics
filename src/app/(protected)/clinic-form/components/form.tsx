"use client";

import { FormControl, FormField, FormMessage } from "@/components/ui/form";
import { FormItem } from "@/components/ui/form";
import { FormLabel } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { z } from "zod/v3";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClinic } from "@/actions/create-clinic";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const clinicFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
});

const ClinicForm = () => {
  const form = useForm<z.infer<typeof clinicFormSchema>>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
    },
  });
  const onSubmit = async (data: z.infer<typeof clinicFormSchema>) => {
    try {
      await createClinic(data.name);
      toast.success("Clínica cadastrada com sucesso");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar clínica");
    }
  };
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Criar clínica
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default ClinicForm;
