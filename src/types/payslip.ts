/**
 * Represents the file type for a payslip document
 */
export type PayslipFileType = 'pdf' | 'image';

/**
 * Represents the file information for a payslip
 */
export interface PayslipFile {
  /** The type of file (PDF or image) */
  type: PayslipFileType;
  /** The file name or path relative to assets */
  uri: string;
}

/**
 * Represents a single payslip record
 */
export interface Payslip {
  /** Unique identifier for the payslip */
  id: string;
  /** Start date of the covered period (ISO format) */
  fromDate: string;
  /** End date of the covered period (ISO format) */
  toDate: string;
  /** The associated file for this payslip */
  file: PayslipFile;
}

/**
 * Sort order options for payslips
 */
export type SortOrder = 'newest' | 'oldest';

/**
 * State shape for the payslip context
 */
export interface PayslipState {
  payslips: Payslip[];
  sortOrder: SortOrder;
  filterText: string;
}

/**
 * Actions available in the payslip context
 */
export interface PayslipContextActions {
  setSortOrder: (order: SortOrder) => void;
  setFilterText: (text: string) => void;
  getPayslipById: (id: string) => Payslip | undefined;
}

/**
 * Complete context value combining state and actions
 */
export interface PayslipContextValue extends PayslipState, PayslipContextActions {
  /** Filtered and sorted payslips ready for display */
  filteredPayslips: Payslip[];
}

