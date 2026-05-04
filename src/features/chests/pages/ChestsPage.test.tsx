import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ChestsPage from './ChestsPage';
import ChestEditorPage from './ChestEditorPage';
function wrap(ui:React.ReactNode, route='/cofres'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier3 cofres',()=>{it('lista y editor con rewards builder',async()=>{wrap(<ChestsPage/>);expect(await screen.findByText('Cofre legendario semanal')).toBeInTheDocument();wrap(<Routes><Route path="/cofres/nuevo" element={<ChestEditorPage/>}/></Routes>,'/cofres/nuevo');expect(screen.getByText('Recompensas posibles')).toBeInTheDocument();expect(screen.getByText('total:')).toBeInTheDocument();fireEvent.click(screen.getByText('Activar'));fireEvent.click(screen.getByText('Guardar como borrador'));fireEvent.click(screen.getByText('agregar recompensa'));expect(screen.getByText('total:')).toBeInTheDocument();fireEvent.click(screen.getByText('Activar'));fireEvent.click(screen.getByText('Guardar como borrador'));});it('empty state',()=>{wrap(<ChestsPage/>,'/cofres?mockState=empty');expect(screen.getByText('No hay cofres')).toBeInTheDocument()})});
