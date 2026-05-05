import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RankingsPage from './RankingsPage';
function wrap(route='/ranking'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><RankingsPage/></QueryClientProvider></MemoryRouter>)}
describe('Ranking',()=>{it('lista, modal config y leaderboard',async()=>{wrap();expect(await screen.findByText('Mejores en XP')).toBeInTheDocument();fireEvent.click(screen.getAllByText('Configurar')[0]);expect(screen.getByText('Premios al top')).toBeInTheDocument();fireEvent.click(screen.getByText('Agregar fila'));fireEvent.click(screen.getByText('Guardar configuración'));fireEvent.click(screen.getAllByText('Ver leaderboard')[0]);expect(await screen.findByText(/top 20/)).toBeInTheDocument();});it('empty',()=>{wrap('/ranking?mockState=empty');expect(screen.getByText('No hay rankings')).toBeInTheDocument()})});
