import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Stethoscope, Users } from "lucide-react";
import { formarCurrencyInCents } from "@/helpers/currency";

interface StatsCardsProps {
  totalRevenue: number;
  totalAppointments: number;
  totalPets: number;
  totalDoctors: number;
}

export const StatsCards = ({
  totalRevenue,
  totalAppointments,
  totalPets,
  totalDoctors,
}: StatsCardsProps) => {
  const stats = [
    {
      label: "Faturamento",
      value: formarCurrencyInCents(totalRevenue),
      icon: DollarSign,
    },
    {
      label: "Agendamentos",
      value: totalAppointments.toString(),
      icon: Calendar,
    },
    {
      label: "Pacientes",
      value: totalPets.toString(),
      icon: Users,
    },
    {
      label: "Médicos",
      value: totalDoctors.toString(),
      icon: Stethoscope,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-muted-foreground text-sm font-medium">
                  {stat.label}
                </span>
              </div>
              <span className="text-3xl font-bold">{stat.value}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
