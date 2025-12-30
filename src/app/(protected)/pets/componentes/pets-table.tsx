"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { petsTable } from "@/db/schema";
import {
  PencilIcon,
  TrashIcon,
  SearchIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import UpsertPetForm from "./upsert-pet-form";
import { useState, useMemo } from "react";
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
import { deletePet } from "@/actions/create-clinic/delete-pet";
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

interface PetsTableProps {
  pets: (typeof petsTable.$inferSelect & {
    tutor?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  })[];
}

const ITEMS_PER_PAGE = 15;

const PetsTable = ({ pets }: PetsTableProps) => {
  const [editingPet, setEditingPet] = useState<
    | (typeof petsTable.$inferSelect & {
        tutor?: {
          id: string;
          name: string;
          email: string;
          phone: string;
        };
      })
    | null
  >(null);
  const [isUpsertDialogOpen, setIsUpsertDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const deletePetAction = useAction(deletePet, {
    onSuccess: () => {
      toast.success("Pet deletado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao deletar pet");
    },
  });

  const filteredPets = useMemo(() => {
    if (!searchTerm.trim()) {
      return pets;
    }
    const term = searchTerm.toLowerCase().trim();
    return pets.filter(
      (pet) =>
        pet.name.toLowerCase().includes(term) ||
        pet.tutor?.name.toLowerCase().includes(term),
    );
  }, [pets, searchTerm]);

  const totalPages = Math.ceil(filteredPets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPets = filteredPets.slice(startIndex, endIndex);

  const handleEdit = (pet: (typeof pets)[0]) => {
    setEditingPet(pet);
    setIsUpsertDialogOpen(true);
  };

  const handleDelete = (petId: string) => {
    deletePetAction.execute({ id: petId });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      canino: "Canino",
      felino: "Felino",
      ave: "Ave",
      roedor: "Roedor",
      reptil: "Réptil",
      outro: "Outro",
    };
    return labels[type] || type;
  };

  const formatPhone = (phone: string | undefined) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
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
            placeholder="Buscar por nome do pet ou nome do tutor..."
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
                  Nome do Pet
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Tipo
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Sexo
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Nome Tutor
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Fone Tutor
                </th>
                <th className="text-muted-foreground h-12 px-4 text-left align-middle font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center"
                  >
                    {searchTerm
                      ? "Nenhum pet encontrado"
                      : "Nenhum pet cadastrado"}
                  </td>
                </tr>
              ) : (
                paginatedPets.map((pet) => (
                  <tr key={pet.id} className="border-b transition-colors">
                    <td className="p-4 align-middle">{pet.name}</td>
                    <td className="p-4 align-middle">
                      {getTypeLabel(pet.type)}
                    </td>
                    <td className="p-4 align-middle">{pet.sex}</td>
                    <td className="p-4 align-middle">
                      {pet.tutor?.name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {formatPhone(pet.tutor?.phone)}
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{pet.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(pet)}>
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                variant="destructive"
                              >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza que deseja deletar o pet "
                                  {pet.name}"?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser revertida. Isso irá
                                  remover o pet da clínica e todas as consultas
                                  agendadas com ele.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pet.id)}
                                >
                                  {deletePetAction.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    "Deletar"
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
      <Dialog
        open={isUpsertDialogOpen}
        onOpenChange={(open) => {
          setIsUpsertDialogOpen(open);
          if (!open) {
            setEditingPet(null);
          }
        }}
      >
        <UpsertPetForm
          pet={editingPet || undefined}
          onSuccess={() => {
            setIsUpsertDialogOpen(false);
            setEditingPet(null);
          }}
        />
      </Dialog>
    </>
  );
};

export default PetsTable;
