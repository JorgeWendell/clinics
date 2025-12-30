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
import { NumericFormat } from "react-number-format";
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
import { petsTable, doctorsTable } from "@/db/schema";
import { Loader2 } from "lucide-react";
import { createAppointment } from "@/actions/create-clinic/create-appointment";
import { updateAppointment } from "@/actions/create-clinic/update-appointment";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { appointmentsTable } from "@/db/schema";
import { useRouter } from "next/navigation";

type Appointment = typeof appointmentsTable.$inferSelect & {
  pet?: typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  doctor?: typeof doctorsTable.$inferSelect;
};

const appointmentFormSchema = z.object({
  petId: z.string().min(1, { message: "Pet é obrigatório" }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório" }),
  date: z.date({ message: "Data é obrigatória" }),
  appointmentPriceInCents: z
    .number()
    .min(0, { message: "Valor da consulta é obrigatório" }),
  time: z.string().optional(),
});

interface UpsertAppointmentFormProps {
  appointment?: Appointment;
  pets: (typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  })[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const UpsertAppointmentForm = ({
  appointment,
  pets,
  doctors,
  onSuccess,
}: UpsertAppointmentFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      petId: appointment?.petId || "",
      doctorId: appointment?.doctorId || "",
      date: appointment?.date ? new Date(appointment.date) : undefined,
      appointmentPriceInCents: appointment?.doctor?.appointmentPriceInCents
        ? appointment.doctor.appointmentPriceInCents / 100
        : 0,
      time: "",
    },
  });

  const selectedDoctorId = form.watch("doctorId");
  const selectedPetId = form.watch("petId");
  const selectedDate = form.watch("date");
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Função para gerar horários disponíveis
  const availableTimes = useMemo(() => {
    if (!selectedDoctor || !selectedDate) {
      return [];
    }

    const selectedDayOfWeek = selectedDate.getDay(); // 0 = domingo, 6 = sábado

    // Verifica se o dia da semana está dentro da disponibilidade do médico
    const fromWeekDay = selectedDoctor.availableFromWeekDay;
    const toWeekDay = selectedDoctor.availableToWeekDay;

    // Se o intervalo cruza o final de semana (ex: sexta a segunda)
    const isWeekendCross = fromWeekDay > toWeekDay;
    const isAvailableDay = isWeekendCross
      ? selectedDayOfWeek >= fromWeekDay || selectedDayOfWeek <= toWeekDay
      : selectedDayOfWeek >= fromWeekDay && selectedDayOfWeek <= toWeekDay;

    if (!isAvailableDay) {
      return [];
    }

    // Parse dos horários de início e fim
    const [fromHour, fromMinute] = selectedDoctor.availableFromTime
      .split(":")
      .map(Number);
    const [toHour, toMinute] = selectedDoctor.availableToTime
      .split(":")
      .map(Number);

    const times: string[] = [];
    let currentHour = fromHour;
    let currentMinute = fromMinute;

    // Gera horários de 30 em 30 minutos
    while (
      currentHour < toHour ||
      (currentHour === toHour && currentMinute < toMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`;
      times.push(timeString);

      // Adiciona 30 minutos
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    // Se for hoje, remove horários passados
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

  useEffect(() => {
    if (selectedDoctor) {
      form.setValue(
        "appointmentPriceInCents",
        selectedDoctor.appointmentPriceInCents / 100,
      );
    }
  }, [selectedDoctor, form]);

  useEffect(() => {
    if (appointment) {
      form.setValue("petId", appointment.petId);
      form.setValue("doctorId", appointment.doctorId);
      if (appointment.date) {
        form.setValue("date", new Date(appointment.date));
      }
      if (appointment.time) {
        form.setValue("time", appointment.time);
      }
      if (appointment.doctor) {
        form.setValue(
          "appointmentPriceInCents",
          appointment.doctor.appointmentPriceInCents / 100,
        );
      }
    }
  }, [appointment, form]);

  const createAppointmentAction = useAction(createAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      form.reset();
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar agendamento");
    },
  });

  const updateAppointmentAction = useAction(updateAppointment, {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso");
      form.reset();
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar agendamento");
    },
  });

  useEffect(() => {
    form.setValue("time", "");
  }, [selectedDate, selectedDoctorId, form]);

  const onSubmit = async (data: z.infer<typeof appointmentFormSchema>) => {
    const dateString = data.date.toISOString().split("T")[0];

    if (appointment?.id) {
      updateAppointmentAction.execute({
        id: appointment.id,
        petId: data.petId,
        doctorId: data.doctorId,
        date: dateString,
        time: data.time,
      });
    } else {
      createAppointmentAction.execute({
        petId: data.petId,
        doctorId: data.doctorId,
        date: dateString,
        time: data.time,
      });
    }
  };

  const isDateEnabled = selectedPetId && selectedDoctorId;
  const isTimeEnabled =
    isDateEnabled && selectedDate && availableTimes.length > 0;
  const isPriceEnabled = !!selectedDoctorId;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {appointment ? "Editar Agendamento" : "Novo Agendamento"}
        </DialogTitle>
        <DialogDescription>
          {appointment
            ? "Altere os campos abaixo para editar o agendamento."
            : "Preencha os campos abaixo para criar um novo agendamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="petId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pet</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um pet" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.tutor?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um médico" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appointmentPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da consulta</FormLabel>
                <FormControl>
                  <NumericFormat
                    customInput={Input}
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue || 0);
                    }}
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    allowNegative={false}
                    fixedDecimalScale={true}
                    prefix="R$"
                    disabled={!isPriceEnabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
              disabled={
                appointment
                  ? updateAppointmentAction.isPending
                  : createAppointmentAction.isPending
              }
            >
              {(appointment
                ? updateAppointmentAction.isPending
                : createAppointmentAction.isPending) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {appointment ? "Salvar Alterações" : "Criar Agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAppointmentForm;
