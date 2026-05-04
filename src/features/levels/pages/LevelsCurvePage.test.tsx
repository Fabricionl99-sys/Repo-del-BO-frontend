import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LevelsCurvePage from './LevelsCurvePage';
function wrap(route='/curva-niveles'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><LevelsCurvePage/></QueryClientProvider></MemoryRouter>)}
describe('Tier2 curva',()=>{it('muestra curva, presets y tabla',async()=>{wrap();expect(await screen.findByText('curva visual · 100 niveles')).toBeInTheDocument();fireEvent.click(await screen.findByText('VIP-focused'));expect(screen.getByText('fórmula matemática')).toBeInTheDocument();fireEvent.click(screen.getByText('logarítmica'));fireEvent.click(screen.getByText('Guardar como borrador'));});it('empty forzado',()=>{wrap('/curva-niveles?mockState=empty');expect(screen.getByText('No hay curva configurada')).toBeInTheDocument()});});
