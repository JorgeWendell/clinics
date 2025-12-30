import z from "zod";

export const upsertPetSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  race: z.string().trim().min(1, { message: "Raça é obrigatória" }),
  type: z.enum(["canino", "felino", "ave", "roedor", "reptil", "outro"], {
    message: "Tipo é obrigatório",
  }),
  sex: z.enum(["Macho", "Femea"], {
    message: "Sexo é obrigatório",
  }),
  tutorName: z.string().trim().min(1, { message: "Nome do tutor é obrigatório" }),
  tutorEmail: z.string().email().trim().min(1, { message: "Email do tutor é obrigatório" }),
  tutorPhone: z.string().trim().min(1, { message: "Telefone do tutor é obrigatório" }),
  tutorId: z.string().optional(),
});

export type UpsertPetSchema = z.infer<typeof upsertPetSchema>;

