import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MissionsPage from './MissionsPage';
import MissionEditorPage from './MissionEditorPage';
function wrap(ui:React.ReactNode, route='/misiones'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier3 misiones',()=>{it('lista y editor funcionan',async()=>{wrap(<MissionsPage/>);expect((await screen.findAllByText(/Apostá/)).length).toBeGreaterThan(0);fireEvent.click(screen.getByText('nueva misión'));wrap(<Routes><Route path="/misiones/nueva" element={<MissionEditorPage/>}/></Routes>,'/misiones/nueva');expect(screen.getByText('Información básica')).toBeInTheDocument();fireEvent.click(screen.getByText('Activar'));});it('empty state',()=>{wrap(<MissionsPage/>,'/misiones?mockState=empty');expect(screen.getByText('No hay misiones')).toBeInTheDocument()})});
