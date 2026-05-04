import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ModerationPage from './ModerationPage';
function wrap(route='/moderacion'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><ModerationPage/></QueryClientProvider></MemoryRouter>)}
describe('Tier5 moderacion',()=>{it('muestra cola, acciones y shortcuts',async()=>{wrap();expect(await screen.findByText('@user_jose123')).toBeInTheDocument();fireEvent.click(screen.getAllByText('comentarios')[0]);fireEvent.click(screen.getAllByText('posts')[0]);fireEvent.click((await screen.findAllByText('aprobar'))[0]);fireEvent.click(screen.getAllByText('rechazar')[0]);expect(screen.getByText('Rechazar contenido')).toBeInTheDocument();fireEvent.click(screen.getByText('Rechazar'));fireEvent.keyDown(window,{key:'r'});fireEvent.click(screen.getByText('Cancelar'));fireEvent.keyDown(window,{key:'b'});expect(screen.getByText('Banear usuario')).toBeInTheDocument();fireEvent.click(screen.getByText('Banear'));});it('empty state',()=>{wrap('/moderacion?mockState=empty');expect(screen.getByText('cola limpia')).toBeInTheDocument()})});
