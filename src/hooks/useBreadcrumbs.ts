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
      "/barber": "Dashboard",
      "/barber/appointments": "Agenda",
      "/barber/clients": "Clientes",
      "/barber/clients/new": "Novo Cliente",
      "/barber/clients/[id]/edit": "Editar Cliente",
      "/barber/employees": "Colaboradores",
      "/barber/employees/new": "Novo Colaborador",
      "/barber/employees/[id]/edit": "Editar Colaborador",
      "/barber/settings": "Configurações",
    };
    console.log("Pathname:", pathname);
    // Divide o pathname em segmentos
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Sempre adiciona o Dashboard como primeiro item se estivermos dentro dele
    if (segments[0] === "barber") {
      let currentPath = "";

      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        console.log("Current Path:", currentPath);

        let label = routeLabels[currentPath];

        // Se não encontrar label específico, tenta com padrão genérico
        if (!label) {
          // Para rotas dinâmicas como /barber/clients/[id]/edit
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
