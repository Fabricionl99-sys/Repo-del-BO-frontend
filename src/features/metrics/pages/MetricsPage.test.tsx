import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MetricsPage from './MetricsPage';
function wrap(route='/metricas'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MetricsPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier5 metricas',()=>{it('muestra KPIs, charts, heatmap y period selector',async()=>{wrap();expect(await screen.findByText('MAU')).toBeInTheDocument();expect(screen.getByText('Funnel de engagement')).toBeInTheDocument();expect(screen.getByText('Distribución VIP')).toBeInTheDocument();expect(screen.getByText('Heatmap de actividad')).toBeInTheDocument();fireEvent.click(screen.getByText('30d'));expect(await screen.findByText('Top 5 reglas')).toBeInTheDocument();});it('empty state',()=>{wrap('/metricas?mockState=empty');expect(screen.getByText('Sin métricas')).toBeInTheDocument()})});
