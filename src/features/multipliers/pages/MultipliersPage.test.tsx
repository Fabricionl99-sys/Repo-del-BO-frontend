import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MultipliersPage from './MultipliersPage';
import MultiplierEditorPage from './MultiplierEditorPage';
function wrap(ui:React.ReactNode, route='/multiplicadores'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier2 multiplicadores',()=>{it('muestra cards, filtros y plantillas',async()=>{wrap(<MultipliersPage/>);expect(await screen.findByText('VIP gold · doble XP')).toBeInTheDocument();fireEvent.click(screen.getByText('eventos'));expect(await screen.findByText('Aniversario Casino Astral cumple 10')).toBeInTheDocument();fireEvent.click(screen.getByText('plantillas'));expect(screen.getByText('Plantillas de multiplicadores')).toBeInTheDocument();});it('empty forzado',()=>{wrap(<MultipliersPage/>, '/multiplicadores?mockState=empty');expect(screen.getByText('No hay multiplicadores')).toBeInTheDocument()});it('editor renderiza y guarda',async()=>{wrap(<Routes><Route path="/multiplicadores/:id" element={<MultiplierEditorPage/>}/></Routes>,'/multiplicadores/mult_vip_gold');expect(await screen.findByText('nombre y factor')).toBeInTheDocument();fireEvent.click(screen.getByText('Activar'));});});
