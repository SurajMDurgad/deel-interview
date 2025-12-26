import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { mockPayslips } from '../data/mockPayslips';
import { Payslip, PayslipContextValue, SortOrder } from '../types/payslip';
import { compareDates } from '../utils/dateUtils';

/**
 * Default context value
 */
const defaultContextValue: PayslipContextValue = {
  payslips: [],
  sortOrder: 'newest',
  filterText: '',
  filteredPayslips: [],
  setSortOrder: () => {},
  setFilterText: () => {},
  getPayslipById: () => undefined,
};

/**
 * React Context for payslip state management
 */
const PayslipContext = createContext<PayslipContextValue>(defaultContextValue);

/**
 * Props for the PayslipProvider component
 */
interface PayslipProviderProps {
  children: ReactNode;
  /** Optional initial payslips for testing */
  initialPayslips?: Payslip[];
}

/**
 * Provider component for payslip state
 */
export function PayslipProvider({ children, initialPayslips }: PayslipProviderProps) {
  // State
  const [payslips] = useState<Payslip[]>(initialPayslips ?? mockPayslips);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [filterText, setFilterText] = useState<string>('');

  /**
   * Get a payslip by its ID
   */
  const getPayslipById = useCallback(
    (id: string): Payslip | undefined => {
      return payslips.find(p => p.id === id);
    },
    [payslips]
  );

  /**
   * Filter and sort payslips based on current state
   */
  const filteredPayslips = useMemo(() => {
    let result = [...payslips];

    // Apply filter
    if (filterText.trim()) {
      const searchLower = filterText.toLowerCase().trim();
      
      result = result.filter(payslip => {
        // Search in ID
        if (payslip.id.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in year (e.g., "2024")
        const yearMatch = payslip.fromDate.includes(searchLower) || 
                          payslip.toDate.includes(searchLower);
        if (yearMatch) {
          return true;
        }
        
        // Search in formatted dates
        const fromDate = new Date(payslip.fromDate);
        const toDate = new Date(payslip.toDate);
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        
        const fromMonth = months[fromDate.getMonth()];
        const toMonth = months[toDate.getMonth()];
        
        if (fromMonth?.includes(searchLower) || toMonth?.includes(searchLower)) {
          return true;
        }
        
        return false;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const ascending = sortOrder === 'oldest';
      return compareDates(a.fromDate, b.fromDate, ascending);
    });

    return result;
  }, [payslips, filterText, sortOrder]);

  /**
   * Context value
   */
  const contextValue: PayslipContextValue = useMemo(
    () => ({
      payslips,
      sortOrder,
      filterText,
      filteredPayslips,
      setSortOrder,
      setFilterText,
      getPayslipById,
    }),
    [payslips, sortOrder, filterText, filteredPayslips, getPayslipById]
  );

  return (
    <PayslipContext.Provider value={contextValue}>
      {children}
    </PayslipContext.Provider>
  );
}

/**
 * Hook to access the payslip context
 * @throws Error if used outside of PayslipProvider
 */
export function usePayslips(): PayslipContextValue {
  const context = useContext(PayslipContext);
  
  if (context === defaultContextValue) {
    throw new Error('usePayslips must be used within a PayslipProvider');
  }
  
  return context;
}

/**
 * Hook to get unique years from all payslips
 */
export function usePayslipYears(): number[] {
  const { payslips } = usePayslips();
  
  return useMemo(() => {
    const years = new Set<number>();
    
    payslips.forEach(payslip => {
      const year = new Date(payslip.fromDate).getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [payslips]);
}

export { PayslipContext };

