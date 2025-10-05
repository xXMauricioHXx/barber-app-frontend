# Sistema de Cache de Agendamentos

Este documento explica como utilizar o sistema de cache de agendamentos implementado para evitar chamadas desnecessárias à API.

## Estrutura

### AppointmentContext

Context provider que gerencia o estado global dos agendamentos e estatísticas.

### useAppointmentStats Hook

Hook personalizado que facilita o acesso às estatísticas sem precisar buscar dados novamente.

### AppointmentStatsCard Component

Componente reutilizável para exibir estatísticas de agendamentos.

## Como Usar

### 1. O Context já está configurado no layout do dashboard

```tsx
// src/app/dashboard/layout.tsx
<AppointmentProvider>{children}</AppointmentProvider>
```

### 2. Usar o hook para acessar estatísticas

```tsx
import { useAppointmentStats } from "@/hooks/useAppointmentStats";

function MinhaComponente() {
  const {
    todayTotal, // Total de agendamentos hoje
    weekTotal, // Total de agendamentos na semana
    monthTotal, // Total de agendamentos no mês
    lastUpdated, // Data da última atualização
    isStale, // Se os dados estão desatualizados (>5min)
    refresh, // Função para forçar atualização
  } = useAppointmentStats();

  return (
    <div>
      <h3>Agendamentos hoje: {todayTotal}</h3>
      {isStale && <button onClick={() => refresh(barberId)}>Atualizar</button>}
    </div>
  );
}
```

### 3. Usar o componente de estatísticas

```tsx
import { AppointmentStatsCard } from "@/components";

function MinhaTela() {
  return (
    <div>
      <AppointmentStatsCard variant="today" showLastUpdated />
      <AppointmentStatsCard variant="week" />
      <AppointmentStatsCard variant="month" />
    </div>
  );
}
```

### 4. Acessar dados completos de agendamentos

```tsx
import { useAppointments } from "@/context/AppointmentContext";

function ListaAgendamentos() {
  const {
    appointments, // Array de agendamentos
    loading, // Estado de carregamento
    error, // Mensagem de erro
    loadTodayAppointments, // Função para carregar agendamentos do dia
    refreshStats, // Função para atualizar estatísticas
    clearCache, // Função para limpar cache
  } = useAppointments();

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {appointments.map((appointment) => (
        <div key={appointment.id}>{appointment.clientName}</div>
      ))}
    </div>
  );
}
```

## Vantagens

1. **Cache Local**: Os totais ficam em memória, evitando chamadas desnecessárias à API
2. **Atualizações Inteligentes**: Dados são atualizados apenas quando necessário
3. **Reutilização**: Múltiplas telas podem usar os mesmos dados sem nova busca
4. **Performance**: Reduz significativamente as consultas ao Firestore
5. **UX Melhorada**: Dados aparecem instantaneamente quando já carregados

## Controle de Cache

- **Expiração**: Dados são considerados desatualizados após 5 minutos
- **Invalidação Manual**: Use `refresh(barberId)` para forçar atualização
- **Limpeza**: Use `clearCache()` para limpar todos os dados (útil no logout)

## Exemplo Prático

```tsx
// Dashboard principal mostra estatísticas
function Dashboard() {
  const { todayTotal, weekTotal, monthTotal } = useAppointmentStats();

  return (
    <div>
      <h1>Dashboard</h1>
      <AppointmentStatsCard variant="today" showLastUpdated />
      <AppointmentStatsCard variant="week" />
      <AppointmentStatsCard variant="month" />
    </div>
  );
}

// Outra tela usa os mesmos dados sem nova busca
function ResumoRapido() {
  const { todayTotal } = useAppointmentStats();

  return <div className="resumo">Você tem {todayTotal} agendamentos hoje</div>;
}
```

## Performance

- ✅ Uma única chamada à API carrega dados para múltiplas telas
- ✅ Cache inteligente com expiração automática
- ✅ Atualizações sob demanda quando necessário
- ✅ Estado global compartilhado entre componentes
