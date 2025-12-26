import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { Payslip } from '@/src/types/payslip';
import { PayslipProvider, usePayslips, usePayslipYears } from '@/src/context/PayslipContext';

// Test data
const testPayslips: Payslip[] = [
  {
    id: 'PS-2024-001',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    file: { type: 'pdf', uri: 'test.pdf' },
  },
  {
    id: 'PS-2024-002',
    fromDate: '2024-02-01',
    toDate: '2024-02-29',
    file: { type: 'pdf', uri: 'test.pdf' },
  },
  {
    id: 'PS-2023-012',
    fromDate: '2023-12-01',
    toDate: '2023-12-31',
    file: { type: 'image', uri: 'test.png' },
  },
  {
    id: 'PS-2024-003',
    fromDate: '2024-03-01',
    toDate: '2024-03-31',
    file: { type: 'pdf', uri: 'test.pdf' },
  },
];

// Wrapper component for testing
const createWrapper = (payslips?: Payslip[]) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PayslipProvider initialPayslips={payslips}>{children}</PayslipProvider>
  );
  return Wrapper;
};

describe('PayslipContext', () => {
  describe('usePayslips hook', () => {
    it('provides payslips data', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      expect(result.current.payslips).toHaveLength(4);
      expect(result.current.payslips[0].id).toBe('PS-2024-001');
    });

    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => usePayslips());
      }).toThrow('usePayslips must be used within a PayslipProvider');

      consoleSpy.mockRestore();
    });

    it('provides initial sortOrder as newest', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      expect(result.current.sortOrder).toBe('newest');
    });

    it('provides initial filterText as empty string', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      expect(result.current.filterText).toBe('');
    });
  });

  describe('getPayslipById', () => {
    it('returns payslip when id exists', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      const payslip = result.current.getPayslipById('PS-2024-002');
      expect(payslip).toBeDefined();
      expect(payslip?.id).toBe('PS-2024-002');
      expect(payslip?.fromDate).toBe('2024-02-01');
    });

    it('returns undefined when id does not exist', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      const payslip = result.current.getPayslipById('NON-EXISTENT');
      expect(payslip).toBeUndefined();
    });
  });

  describe('filtering', () => {
    it('filters payslips by ID', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('PS-2024-001');
      });

      expect(result.current.filteredPayslips).toHaveLength(1);
      expect(result.current.filteredPayslips[0].id).toBe('PS-2024-001');
    });

    it('filters payslips by year', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('2023');
      });

      expect(result.current.filteredPayslips).toHaveLength(1);
      expect(result.current.filteredPayslips[0].id).toBe('PS-2023-012');
    });

    it('filters payslips by month name', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('jan');
      });

      expect(result.current.filteredPayslips).toHaveLength(1);
      expect(result.current.filteredPayslips[0].id).toBe('PS-2024-001');
    });

    it('returns all payslips when filter is empty', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('');
      });

      expect(result.current.filteredPayslips).toHaveLength(4);
    });

    it('returns empty array when no payslips match filter', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('nonexistent');
      });

      expect(result.current.filteredPayslips).toHaveLength(0);
    });

    it('filter is case insensitive', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setFilterText('PS-2024-001');
      });

      const upperCaseResult = result.current.filteredPayslips;

      act(() => {
        result.current.setFilterText('ps-2024-001');
      });

      expect(result.current.filteredPayslips).toHaveLength(upperCaseResult.length);
    });
  });

  describe('sorting', () => {
    it('sorts payslips newest first by default', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      const payslips = result.current.filteredPayslips;
      expect(payslips[0].id).toBe('PS-2024-003'); // March 2024
      expect(payslips[1].id).toBe('PS-2024-002'); // February 2024
      expect(payslips[2].id).toBe('PS-2024-001'); // January 2024
      expect(payslips[3].id).toBe('PS-2023-012'); // December 2023
    });

    it('sorts payslips oldest first when sortOrder is oldest', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      act(() => {
        result.current.setSortOrder('oldest');
      });

      const payslips = result.current.filteredPayslips;
      expect(payslips[0].id).toBe('PS-2023-012'); // December 2023
      expect(payslips[1].id).toBe('PS-2024-001'); // January 2024
      expect(payslips[2].id).toBe('PS-2024-002'); // February 2024
      expect(payslips[3].id).toBe('PS-2024-003'); // March 2024
    });

    it('can toggle between newest and oldest', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      // Initially newest
      expect(result.current.sortOrder).toBe('newest');
      expect(result.current.filteredPayslips[0].id).toBe('PS-2024-003');

      // Change to oldest
      act(() => {
        result.current.setSortOrder('oldest');
      });

      expect(result.current.sortOrder).toBe('oldest');
      expect(result.current.filteredPayslips[0].id).toBe('PS-2023-012');

      // Back to newest
      act(() => {
        result.current.setSortOrder('newest');
      });

      expect(result.current.sortOrder).toBe('newest');
      expect(result.current.filteredPayslips[0].id).toBe('PS-2024-003');
    });
  });

  describe('combined filtering and sorting', () => {
    it('applies both filter and sort correctly', () => {
      const { result } = renderHook(() => usePayslips(), {
        wrapper: createWrapper(testPayslips),
      });

      // Filter to 2024 payslips only
      act(() => {
        result.current.setFilterText('2024');
      });

      expect(result.current.filteredPayslips).toHaveLength(3);
      // Should be sorted newest first
      expect(result.current.filteredPayslips[0].fromDate).toBe('2024-03-01');

      // Change to oldest
      act(() => {
        result.current.setSortOrder('oldest');
      });

      expect(result.current.filteredPayslips[0].fromDate).toBe('2024-01-01');
    });
  });
});

describe('usePayslipYears hook', () => {
  it('returns unique years sorted in descending order', () => {
    const { result } = renderHook(() => usePayslipYears(), {
      wrapper: createWrapper(testPayslips),
    });

    expect(result.current).toEqual([2024, 2023]);
  });

  it('returns empty array when no payslips', () => {
    const { result } = renderHook(() => usePayslipYears(), {
      wrapper: createWrapper([]),
    });

    expect(result.current).toEqual([]);
  });

  it('returns single year when all payslips are from same year', () => {
    const sameYearPayslips: Payslip[] = [
      {
        id: 'PS-2024-001',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
        file: { type: 'pdf', uri: 'test.pdf' },
      },
      {
        id: 'PS-2024-002',
        fromDate: '2024-06-01',
        toDate: '2024-06-30',
        file: { type: 'pdf', uri: 'test.pdf' },
      },
    ];

    const { result } = renderHook(() => usePayslipYears(), {
      wrapper: createWrapper(sameYearPayslips),
    });

    expect(result.current).toEqual([2024]);
  });
});

