import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import RulesListPage from './RulesListPage';
import RuleEditorPage from './RuleEditorPage';
function wrap(ui:React.ReactNode, route='/reglas-xp'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier2 reglas',()=>{it('lista reglas con filtros y acciones',async()=>{wrap(<RulesListPage/>);expect(await screen.findByText('Apuesta deportiva ganadora')).toBeInTheDocument();fireEvent.click(screen.getByText('pausadas'));expect(await screen.findByText('Promo finde Champions League')).toBeInTheDocument();fireEvent.click(screen.getAllByTitle('duplicar')[0]);});it('lista muestra empty forzado',()=>{wrap(<RulesListPage/>, '/reglas-xp?mockState=empty');expect(screen.getByText('Todavía no tenés reglas')).toBeInTheDocument()});it('editor permite agregar condición y cambiar monedas',async()=>{wrap(<Routes><Route path="/reglas-xp/:id" element={<RuleEditorPage/>}/></Routes>,'/reglas-xp/rule_sports_win');expect(await screen.findByText('¿qué evento dispara esta regla?')).toBeInTheDocument();fireEvent.click(screen.getByText('agregar condición'));expect(screen.getAllByTitle('eliminar').length).toBeGreaterThan(0);fireEvent.click(screen.getByText('Activar'));});});
