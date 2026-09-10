import { useContext } from 'react';
import { ScanContext } from '../context/ScanContext';

export function useScan() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
}
