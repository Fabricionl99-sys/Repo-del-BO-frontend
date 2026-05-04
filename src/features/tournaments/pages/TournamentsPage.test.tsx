import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TournamentsPage from './TournamentsPage';
import TournamentEditorPage from './TournamentEditorPage';
function wrap(ui:React.ReactNode, route='/torneos'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier3 torneos',()=>{it('lista y editor con BlockConditions',async()=>{wrap(<TournamentsPage/>);expect(await screen.findByText(/Liga semanal/)).toBeInTheDocument();expect(screen.getByText(/En vivo ahora/)).toBeInTheDocument();wrap(<Routes><Route path="/torneos/nuevo" element={<TournamentEditorPage/>}/></Routes>,'/torneos/nuevo');expect(screen.getByText('Prize pool')).toBeInTheDocument();fireEvent.click(screen.getByText('agregar condición'));fireEvent.click(screen.getByText('Activar'));});it('empty state',()=>{wrap(<TournamentsPage/>,'/torneos?mockState=empty');expect(screen.getByText('No hay torneos')).toBeInTheDocument()})});
