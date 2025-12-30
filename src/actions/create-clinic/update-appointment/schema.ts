import z from "zod";

export const updateAppointmentSchema = z.object({
  id: z.string().min(1),
  petId: z.string().min(1, { message: "Pet é obrigatório" }).optional(),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }).optional(),
  date: z.string().min(1, { message: "Data é obrigatória" }).optional(),
  time: z.string().optional(),
});

export type UpdateAppointmentSchema = z.infer<typeof updateAppointmentSchema>;

