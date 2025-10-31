import { Card, CardContent } from "@/components/ui/card";
import { Users, User, Shield, Settings } from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import type { UserStats } from "../types/usuarios.types";

interface UserStatisticsProps {
  stats: UserStats;
}

/**
 * Componente que muestra las estadísticas generales de usuarios
 */
export function UserStatistics({ stats }: UserStatisticsProps) {
  const statsCards = [
    {
      title: "Total Usuarios",
      value: stats.total,
      subtitle: "+2 este mes",
      icon: Users,
      delay: 0.1,
    },
    {
      title: "Usuarios Activos",
      value: stats.activos,
      subtitle: `${stats.porcentajeActivos}% del total`,
      icon: User,
      delay: 0.2,
    },
    {
      title: "Roles Diferentes",
      value: stats.rolesUnicos,
      subtitle: "Bien distribuido",
      icon: Shield,
      delay: 0.3,
    },
    {
      title: "Suspendidos",
      value: stats.suspendidos,
      subtitle: "Requieren atención",
      icon: Settings,
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat) => (
        <SlideIn key={stat.title} direction="up" delay={stat.delay}>
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      ))}
    </div>
  );
}
