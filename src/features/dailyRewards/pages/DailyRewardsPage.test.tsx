import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DailyRewardsPage from './DailyRewardsPage';
function wrap(route='/recompensas-diarias'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><DailyRewardsPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier3 recompensas diarias',()=>{it('muestra ciclos y editor de día',async()=>{wrap();expect(await screen.findByText('Ciclo semanal')).toBeInTheDocument();fireEvent.click(screen.getByText('VIP mensual'));expect(screen.getByText('Configuración del ciclo "VIP mensual"')).toBeInTheDocument();fireEvent.click(screen.getByText('Día 1'));expect(screen.getByText('Editar día 1')).toBeInTheDocument();});it('empty state',()=>{wrap('/recompensas-diarias?mockState=empty');expect(screen.getByText('No hay ciclos')).toBeInTheDocument()})});
