import z from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(1),
    email: z.string().email().trim().optional(),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z.string().trim().min(1),
    availableToTime: z.string().trim().min(1),
    avatarImageUrl: z.string().trim().optional(),
    speciality: z.string().trim().min(1),
    appointmentPriceInCents: z.number().min(0),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      path: ["availableToTime"],
      message: "A hora inicial deve ser menor que a hora final",
    },
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
