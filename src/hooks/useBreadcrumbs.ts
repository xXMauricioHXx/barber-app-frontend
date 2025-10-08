"use client";

import { useMemo } from "react";
import { usePathname, useParams } from "next/navigation";

export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    // Mapeamento de rotas para labels amigáveis
    const routeLabels: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/dashboard/appointments": "Agenda",
      "/dashboard/clients": "Clientes",
      "/dashboard/clients/new": "Novo Cliente",
      "/dashboard/clients/[id]/edit": "Editar Cliente",
      "/dashboard/employees": "Funcionários",
      "/dashboard/employees/new": "Novo Funcionário",
      "/dashboard/employees/[id]/edit": "Editar Funcionário",
      "/dashboard/settings": "Configurações",
    };

    // Divide o pathname em segmentos
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Sempre adiciona o Dashboard como primeiro item se estivermos dentro dele
    if (segments[0] === "dashboard") {
      let currentPath = "";

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;

        let label = routeLabels[currentPath];

        // Se não encontrar label específico, tenta com padrão genérico
        if (!label) {
          // Para rotas dinâmicas como /dashboard/clients/[id]/edit
          const genericPath = currentPath.replace(
            /\/[^/]+\/edit$/,
            "/[id]/edit"
          );
          label = routeLabels[genericPath];
        }

        // Se ainda não encontrar, usa o segmento capitalizado
        if (!label) {
          // Trata IDs como "Detalhes" para melhor UX
          if (/^[a-f0-9-]{20,}$/.test(segment) || params?.id === segment) {
            label = "Detalhes";
          } else {
            label = segment.charAt(0).toUpperCase() + segment.slice(1);

            // Alguns tratamentos especiais
            if (segment === "new") label = "Novo";
            if (segment === "edit") label = "Editar";
          }
        }

        items.push({
          label,
          path: currentPath,
          isLast: index === segments.length - 1,
        });
      });
    }

    return items;
  }, [pathname, params]);

  return breadcrumbs;
}
