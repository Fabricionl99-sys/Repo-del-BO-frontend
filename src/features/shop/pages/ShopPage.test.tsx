import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ShopPage from './ShopPage';
function wrap(route='/tienda'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><ShopPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier4 tienda',()=>{it('muestra productos, filtros y crea producto',async()=>{wrap();expect(await screen.findByText('Bonus de $10 USD')).toBeInTheDocument();fireEvent.click(screen.getAllByText('digital')[0]);expect(await screen.findByText(/Book of Dead/)).toBeInTheDocument();fireEvent.click(screen.getByText('nuevo producto'));expect(screen.getByText('Nuevo producto')).toBeInTheDocument();fireEvent.change(screen.getByDisplayValue('Nuevo producto QA'),{target:{value:'Producto QA spins'}});fireEvent.click(screen.getByText('pedir signed URL de imagen'));fireEvent.click(screen.getByText('guardar producto'));expect(await screen.findByText('Producto QA spins',{}, {timeout:5000})).toBeInTheDocument();});it('empty forzado',()=>{wrap('/tienda?mockState=empty');expect(screen.getByText('No hay productos')).toBeInTheDocument()})});
