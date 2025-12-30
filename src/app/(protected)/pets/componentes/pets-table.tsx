"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { petsTable } from "@/db/schema";
import { PencilIcon, TrashIcon, SearchIcon } from "lucide-react";
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
    (typeof petsTable.$inferSelect & {
      tutor?: {
        id: string;
        name: string;
        email: string;
        phone: string;
      };
    }) | null
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

  const handleEdit = (pet: typeof pets[0]) => {
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
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do pet ou nome do tutor..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-80"
          />
        </div>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome do Pet
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Tipo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Sexo
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Nome Tutor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Fone Tutor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
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
                      {pet.tutor?.phone || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(pet)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Tem certeza que deseja deletar o pet "{pet.name}"?
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
                      </div>
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

