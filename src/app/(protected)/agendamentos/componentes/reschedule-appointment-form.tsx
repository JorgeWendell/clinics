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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { Loader2 } from "lucide-react";
import { updateAppointment } from "@/actions/create-clinic/update-appointment";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Appointment = typeof appointmentsTable.$inferSelect & {
  doctor?: typeof doctorsTable.$inferSelect;
};

const rescheduleAppointmentFormSchema = z.object({
  date: z.date({ message: "Data é obrigatória" }),
  time: z.string().optional(),
});

interface RescheduleAppointmentFormProps {
  appointment?: Appointment;
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const RescheduleAppointmentForm = ({
  appointment,
  doctors,
  onSuccess,
}: RescheduleAppointmentFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof rescheduleAppointmentFormSchema>>({
    resolver: zodResolver(rescheduleAppointmentFormSchema),
    defaultValues: {
      date: appointment?.date ? new Date(appointment.date) : undefined,
      time: appointment?.time || "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedDoctor = appointment?.doctorId
    ? doctors.find((d) => d.id === appointment.doctorId)
    : null;

  const availableTimes = useMemo(() => {
    if (!selectedDoctor || !selectedDate) {
      return [];
    }

    const selectedDayOfWeek = selectedDate.getDay();

    const fromWeekDay = selectedDoctor.availableFromWeekDay;
    const toWeekDay = selectedDoctor.availableToWeekDay;

    const isWeekendCross = fromWeekDay > toWeekDay;
    const isAvailableDay = isWeekendCross
      ? selectedDayOfWeek >= fromWeekDay || selectedDayOfWeek <= toWeekDay
      : selectedDayOfWeek >= fromWeekDay && selectedDayOfWeek <= toWeekDay;

    if (!isAvailableDay) {
      return [];
    }

    const [fromHour, fromMinute] = selectedDoctor.availableFromTime
      .split(":")
      .map(Number);
    const [toHour, toMinute] = selectedDoctor.availableToTime
      .split(":")
      .map(Number);

    const times: string[] = [];
    let currentHour = fromHour;
    let currentMinute = fromMinute;

    while (
      currentHour < toHour ||
      (currentHour === toHour && currentMinute < toMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`;
      times.push(timeString);

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    if (isToday) {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      return times.filter((time) => {
        const [hour, minute] = time.split(":").map(Number);
        const timeInMinutes = hour * 60 + minute;
        return timeInMinutes > currentTime;
      });
    }

    return times;
  }, [selectedDoctor, selectedDate]);

  const updateAppointmentAction = useAction(updateAppointment, {
    onSuccess: () => {
      toast.success("Agendamento reagendado com sucesso");
      form.reset();
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao reagendar agendamento");
    },
  });

  useEffect(() => {
    form.setValue("time", "");
  }, [selectedDate, form]);

  const onSubmit = async (data: z.infer<typeof rescheduleAppointmentFormSchema>) => {
    if (!appointment?.id) return;

    const dateString = data.date.toISOString().split("T")[0];

    updateAppointmentAction.execute({
      id: appointment.id,
      petId: appointment.petId,
      doctorId: appointment.doctorId,
      date: dateString,
      time: data.time,
    });
  };

  const isDateEnabled = !!selectedDoctor;
  const isTimeEnabled = isDateEnabled && selectedDate && availableTimes.length > 0;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Reagendar Agendamento</DialogTitle>
        <DialogDescription>
          Altere a data e horário do agendamento.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        data-empty={!field.value}
                        className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                        disabled={!isDateEnabled}
                      >
                        <CalendarIcon />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!isTimeEnabled}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimes.length === 0 ? (
                      <div className="text-muted-foreground px-2 py-1.5 text-sm">
                        Nenhum horário disponível
                      </div>
                    ) : (
                      availableTimes.map((time) => {
                        const [hour, minute] = time.split(":");
                        const displayTime = `${hour}:${minute}`;
                        return (
                          <SelectItem key={time} value={time}>
                            {displayTime}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={updateAppointmentAction.isPending}
            >
              {updateAppointmentAction.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Reagendar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default RescheduleAppointmentForm;

