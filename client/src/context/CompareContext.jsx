import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (college) => {
    if (compareList.find(c => c._id === college._id)) return;
    if (compareList.length >= 3) return;
    setCompareList(prev => [...prev, college]);
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(c => c._id !== id));
  };

  const isInCompare    = (id) => compareList.some(c => c._id === id);
  const clearCompare   = ()   => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);