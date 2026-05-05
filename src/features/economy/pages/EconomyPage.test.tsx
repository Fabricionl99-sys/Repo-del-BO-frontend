import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import EconomyPage from './EconomyPage';

function wrap(){
  cleanup();
  return render(<MemoryRouter><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><EconomyPage/></QueryClientProvider></MemoryRouter>);
}

describe('EconomyPage',()=>{
  it('carga inputs, recalcula ejemplo y guarda',async()=>{
    wrap();
    expect(await screen.findByText('Conversión Apuesta → XP')).toBeInTheDocument();
    const usd=screen.getByLabelText('Cada cuántos dólares apostados se gana 1 XP');
    const xp=screen.getByLabelText('Cada cuántos XP se gana 1 coin');
    fireEvent.change(usd,{target:{value:'50'}});
    fireEvent.change(xp,{target:{value:'2'}});
    expect(screen.getByText('20 XP')).toBeInTheDocument();
    expect(screen.getByText('10 coins')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Guardar cambios'));
    await waitFor(()=>expect(screen.getByDisplayValue('50')).toBeInTheDocument());
  });

  it('valida valores mayores a cero',async()=>{
    wrap();
    expect(await screen.findByText('Conversión Apuesta → XP')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cada cuántos dólares apostados se gana 1 XP'),{target:{value:'0'}});
    expect(screen.getByText('Los valores deben ser enteros mayores a 0.')).toBeInTheDocument();
    expect(screen.getByText('Guardar cambios')).toBeDisabled();
  });
});
