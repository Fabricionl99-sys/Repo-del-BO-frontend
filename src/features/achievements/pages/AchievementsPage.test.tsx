import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AchievementsPage from './AchievementsPage';
import AchievementEditorPage from './AchievementEditorPage';
function wrap(ui:React.ReactNode, route='/logros'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier3 logros',()=>{it('grid por tiers y editor',async()=>{wrap(<AchievementsPage/>);expect(await screen.findByText('Primera apuesta')).toBeInTheDocument();fireEvent.click(screen.getByText('diamond'));expect(await screen.findByText('High Roller')).toBeInTheDocument();wrap(<Routes><Route path="/logros/nuevo" element={<AchievementEditorPage/>}/></Routes>,'/logros/nuevo');expect(screen.getByText('Condición de desbloqueo')).toBeInTheDocument();fireEvent.click(screen.getByText('Activar'));});it('empty state',()=>{wrap(<AchievementsPage/>,'/logros?mockState=empty');expect(screen.getByText('No hay logros')).toBeInTheDocument()})});
