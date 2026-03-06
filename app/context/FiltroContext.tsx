// app/context/FiltroContext.tsx
import React, { createContext, useContext, useState } from 'react';

type FiltroStatus = 'todos' | 'ativo' | 'inativo';

interface FiltroContextType {
  filtroStatus: FiltroStatus;
  setFiltroStatus: (status: FiltroStatus) => void;
}

const FiltroContext = createContext<FiltroContextType>({
  filtroStatus: 'todos',
  setFiltroStatus: () => {},
});

export function FiltroProvider({ children }: { children: React.ReactNode }) {
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativo');
  return (
    <FiltroContext.Provider value={{ filtroStatus, setFiltroStatus }}>
      {children}
    </FiltroContext.Provider>
  );
}

export const useFiltro = () => useContext(FiltroContext);
export default FiltroProvider;