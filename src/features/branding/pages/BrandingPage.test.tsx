import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import BrandingPage from './BrandingPage';
function wrap(route='/branding'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><BrandingPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier5 branding',()=>{it('muestra controles, preview iframe y publica',async()=>{wrap();expect(await screen.findByText('paletas predefinidas')).toBeInTheDocument();fireEvent.click(await screen.findByText('casino clásico'));expect(screen.getByText('Preview en vivo')).toBeInTheDocument();fireEvent.change(screen.getByDisplayValue('Bienvenido a Casino Astral'),{target:{value:'Hola WINGOAT'}});fireEvent.click(screen.getByTitle('desktop'));fireEvent.click(screen.getByText('sugerir paleta desde logo'));fireEvent.click(screen.getByText('publicar cambios'));});it('empty state',()=>{wrap('/branding?mockState=empty');expect(screen.getByText('Sin branding')).toBeInTheDocument()})});
