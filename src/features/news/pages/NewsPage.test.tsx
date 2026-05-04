import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NewsPage from './NewsPage';
import NewsEditorPage from './NewsEditorPage';
function wrap(ui:React.ReactNode, route='/noticias'){cleanup();return render(<MemoryRouter initialEntries={[route]}><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider></MemoryRouter>)}
describe('Tier4 noticias',()=>{it('muestra pinned y permite pin',async()=>{wrap(<NewsPage/>);expect(await screen.findByText(/Grand Slam Mayo/)).toBeInTheDocument();expect(screen.getByText(/Pinned/)).toBeInTheDocument();fireEvent.click(screen.getAllByTitle('pin')[0]);});it('editor rich text publica noticia',async()=>{wrap(<Routes><Route path="/noticias/nueva" element={<NewsEditorPage/>}/></Routes>,'/noticias/nueva');expect(screen.getByText('Contenido')).toBeInTheDocument();fireEvent.change(screen.getByDisplayValue('Nueva noticia'),{target:{value:'Noticia QA publicada'}});fireEvent.click(screen.getByText('bold'));fireEvent.click(screen.getByText('Activar'));});it('empty forzado',()=>{wrap(<NewsPage/>,'/noticias?mockState=empty');expect(screen.getByText('No hay noticias')).toBeInTheDocument()})});
