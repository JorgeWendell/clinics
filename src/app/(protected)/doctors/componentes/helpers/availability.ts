import { doctorsTable } from "@/db/schema";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/pt-br";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

export const getAvailability = (doctor: typeof doctorsTable.$inferSelect) => {
  const from = dayjs()
    .tz("America/Sao_Paulo")
    .day(doctor.availableFromWeekDay)
    .set("hour", Number(doctor.availableFromTime.split(":")[0]))
    .set("minute", Number(doctor.availableFromTime.split(":")[1]))
    .set("second", Number(doctor.availableFromTime.split(":")[2] || 0))
    .local();
  const to = dayjs()
    .tz("America/Sao_Paulo")
    .day(doctor.availableToWeekDay)
    .set("hour", Number(doctor.availableToTime.split(":")[0]))
    .set("minute", Number(doctor.availableToTime.split(":")[1]))
    .set("second", Number(doctor.availableToTime.split(":")[2] || 0))
    .local();
  return { from, to };
};
