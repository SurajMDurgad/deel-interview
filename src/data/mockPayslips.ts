import { Payslip } from '../types/payslip';

/**
 * Mock payslip data for the application
 * All payslips reference the same sample PDF file as per requirements
 */
export const mockPayslips: Payslip[] = [
  {
    id: 'PS-2024-001',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    file: { type: 'pdf', uri: 'requirement.pdf' },
  },
  {
    id: 'PS-2024-002',
    fromDate: '2024-02-01',
    toDate: '2024-02-29',
    file: { type: 'pdf', uri: 'requirement.pdf' },
  },
  {
    id: 'PS-2024-003',
    fromDate: '2024-03-01',
    toDate: '2024-03-31',
    file: { type: 'pdf', uri: 'requirement.pdf' },
  },
  {
    id: 'PS-2024-004',
    fromDate: '2024-04-01',
    toDate: '2024-04-30',
    file: { type: 'pdf', uri: 'requirement.pdf' },
  },
  {
    id: 'PS-2024-005',
    fromDate: '2024-05-01',
    toDate: '2024-05-31',
    file: { type: 'pdf', uri: 'requirement.pdf' },
  },
  {
    id: 'PS-2023-011',
    fromDate: '2023-11-01',
    toDate: '2023-11-30',
    file: { type: 'pdf', uri: 'requirment.pdf' },
  },
  {
    id: 'PS-2023-012',
    fromDate: '2023-12-01',
    toDate: '2023-12-31',
    file: { type: 'pdf', uri: 'requirment.pdf' },
  },
];

