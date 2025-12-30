"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { appointmentsTable, petsTable, doctorsTable } from "@/db/schema";
import {
  PencilIcon,
  TrashIcon,
  SearchIcon,
  MoreHorizontalIcon,
  CalendarIcon,
} from "lucide-react";
import UpsertAppointmentForm from "./upsert-appointment-form";
import RescheduleAppointmentForm from "./reschedule-appointment-form";
import { useState, useMemo, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAppointment } from "@/actions/create-clinic/delete-appointment";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { useRouter } from "next/navigation";
import { formarCurrencyInCents } from "@/helpers/currency";

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

interface AppointmentsTableProps {
  appointments: Appointment[];
  pets: (typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  })[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const ITEMS_PER_PAGE = 15;

const AppointmentsTable = ({
  appointments,
  pets,
  doctors,
}: AppointmentsTableProps) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [reschedulingAppointment, setReschedulingAppointment] =
    useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso");
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento");
    },
  });

  const filteredAppointments = useMemo(() => {
    if (!searchTerm.trim()) {
      return appointments;
    }
    const term = searchTerm.toLowerCase().trim();
    return appointments.filter(
      (appointment) =>
        appointment.pet?.name.toLowerCase().includes(term) ||
        appointment.pet?.tutor?.name.toLowerCase().includes(term) ||
        appointment.doctor?.name.toLowerCase().includes(term),
    );
  }, [appointments, searchTerm]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    endIndex,
  );

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsEditDialogOpen(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
    setIsRescheduleDialogOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    deleteAppointmentAction.execute({ id: appointmentId });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string | Date, time?: string | null) => {
    let date: Date;
    if (typeof dateString === "string") {
      const [year, month, day] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = dateString;
    }
    const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
    if (time) {
      const [hour, minute] = time.split(":");
      return `${formattedDate} ${hour}:${minute}`;
    }
    return formattedDate;
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative w-fit">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por pet, tutor ou médico..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-80 pl-9"
          />
        </div>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Pet
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Tutor
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Médico
                </th>
                      <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                        Data/Hora
                      </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Preço
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    {searchTerm
                      ? "Nenhum agendamento encontrado"
                      : "Nenhum agendamento cadastrado"}
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b transition-colors">
                    <td className="p-4 align-middle">
                      {appointment.pet?.name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {appointment.pet?.tutor?.name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {appointment.doctor?.name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {formatDate(appointment.date, appointment.time)}
                    </td>
                    <td className="p-4 align-middle">
                      {appointment.doctor?.appointmentPriceInCents
                        ? formarCurrencyInCents(appointment.doctor.appointmentPriceInCents)
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {appointment.pet?.name}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEdit(appointment)}
                          >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReschedule(appointment)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Reagendar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza que deseja cancelar o agendamento?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser revertida. Isso irá
                                  remover o agendamento permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(appointment.id)}
                                >
                                  {deleteAppointmentAction.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    "Confirmar"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      {mounted && (
        <>
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) {
                setEditingAppointment(null);
              }
            }}
          >
            <UpsertAppointmentForm
              appointment={editingAppointment || undefined}
              pets={pets}
              doctors={doctors}
              appointments={appointments}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingAppointment(null);
              }}
            />
          </Dialog>
          <Dialog
            open={isRescheduleDialogOpen}
            onOpenChange={(open) => {
              setIsRescheduleDialogOpen(open);
              if (!open) {
                setReschedulingAppointment(null);
              }
            }}
          >
            <RescheduleAppointmentForm
              appointment={reschedulingAppointment || undefined}
              doctors={doctors}
              appointments={appointments}
              onSuccess={() => {
                setIsRescheduleDialogOpen(false);
                setReschedulingAppointment(null);
              }}
            />
          </Dialog>
        </>
      )}
    </>
  );
};

export default AppointmentsTable;

