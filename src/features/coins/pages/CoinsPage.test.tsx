import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CoinsPage from './CoinsPage';
function wrap(route='/monedas'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><CoinsPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier2 monedas',()=>{it('muestra monedas y reglas globales',async()=>{wrap();expect(await screen.findByText('Monedas oro')).toBeInTheDocument();expect(await screen.findByText('Reglas globales de circulación')).toBeInTheDocument();fireEvent.click(screen.getByText('nueva moneda'));expect(screen.getByText('Nueva moneda')).toBeInTheDocument();});it('empty forzado',()=>{wrap('/monedas?mockState=empty');expect(screen.getByText('No hay monedas configuradas')).toBeInTheDocument()});});
