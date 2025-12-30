import z from "zod";

export const createAppointmentSchema = z.object({
  petId: z.string().min(1, { message: "Pet é obrigatório" }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }),
  date: z.string().min(1, { message: "Data é obrigatória" }),
  time: z.string().optional(),
});

export type CreateAppointmentSchema = z.infer<typeof createAppointmentSchema>;

