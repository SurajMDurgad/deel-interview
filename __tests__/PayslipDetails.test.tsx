import PayslipDetailsScreen from '@/app/payslip/[id]';
import { PayslipProvider } from '@/src/context/PayslipContext';
import {
  downloadPayslip,
  previewPayslip,
  showFileOperationAlert,
} from '@/src/services/fileService';
import { Payslip } from '@/src/types/payslip';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock expo-router
const mockLocalSearchParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockLocalSearchParams(),
  Stack: {
    Screen: () => null,
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock file service
jest.mock('@/src/services/fileService', () => ({
  downloadPayslip: jest.fn().mockResolvedValue({ success: true }),
  previewPayslip: jest.fn().mockResolvedValue({ success: true }),
  showFileOperationAlert: jest.fn(),
}));

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
    file: { type: 'image', uri: 'test.png' },
  },
];

// Wrapper component for testing
const renderWithProvider = (payslips: Payslip[] = testPayslips) => {
  return render(
    <PayslipProvider initialPayslips={payslips}>
      <PayslipDetailsScreen />
    </PayslipProvider>
  );
};

describe('PayslipDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalSearchParams.mockReturnValue({ id: 'PS-2024-001' });
  });

  describe('rendering with valid payslip', () => {
    it('renders the period text', () => {
      renderWithProvider();

      expect(screen.getByText('Jan 1 – 31, 2024')).toBeTruthy();
    });

    it('renders the payslip ID in details', () => {
      renderWithProvider();

      expect(screen.getByText('PS-2024-001')).toBeTruthy();
    });

    it('renders the from date', () => {
      renderWithProvider();

      expect(screen.getByText('Jan 1, 2024')).toBeTruthy();
    });

    it('renders the to date', () => {
      renderWithProvider();

      expect(screen.getByText('Jan 31, 2024')).toBeTruthy();
    });

    it('renders PDF file type badge', () => {
      renderWithProvider();

      expect(screen.getByText('PDF')).toBeTruthy();
    });

    it('renders PDF Document text in details', () => {
      renderWithProvider();

      expect(screen.getByText('PDF Document')).toBeTruthy();
    });

    it('renders Details section', () => {
      renderWithProvider();

      expect(screen.getByText('Details')).toBeTruthy();
    });

    it('renders Actions section', () => {
      renderWithProvider();

      expect(screen.getByText('Actions')).toBeTruthy();
    });

    it('renders Download button', () => {
      renderWithProvider();

      expect(screen.getByText('Download Payslip')).toBeTruthy();
    });

    it('renders Preview button', () => {
      renderWithProvider();

      expect(screen.getByText('Preview Payslip')).toBeTruthy();
    });
  });

  describe('rendering with image payslip', () => {
    beforeEach(() => {
      mockLocalSearchParams.mockReturnValue({ id: 'PS-2024-002' });
    });

    it('renders IMAGE file type badge', () => {
      renderWithProvider();

      expect(screen.getByText('IMAGE')).toBeTruthy();
    });

    it('renders Image text in file type details', () => {
      renderWithProvider();

      expect(screen.getByText('Image')).toBeTruthy();
    });
  });

  describe('rendering with invalid payslip', () => {
    beforeEach(() => {
      mockLocalSearchParams.mockReturnValue({ id: 'INVALID-ID' });
    });

    it('renders error state', () => {
      renderWithProvider();

      expect(screen.getByText('Payslip Not Found')).toBeTruthy();
    });

    it('renders error message', () => {
      renderWithProvider();

      expect(screen.getByText('The requested payslip could not be found')).toBeTruthy();
    });

    it('renders warning emoji', () => {
      renderWithProvider();

      expect(screen.getByText('⚠️')).toBeTruthy();
    });
  });

  describe('download functionality', () => {
    it('calls downloadPayslip when download button is pressed', async () => {
      renderWithProvider();

      const downloadButton = screen.getByText('Download Payslip');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(downloadPayslip).toHaveBeenCalledTimes(1);
      });
    });

    it('passes the correct payslip to downloadPayslip', async () => {
      renderWithProvider();

      const downloadButton = screen.getByText('Download Payslip');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(downloadPayslip).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'PS-2024-001' }),
          true
        );
      });
    });

    it('does not show alert after successful download (iOS shows its own)', async () => {
      renderWithProvider();

      const downloadButton = screen.getByText('Download Payslip');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(downloadPayslip).toHaveBeenCalled();
      });

      // showFileOperationAlert should NOT be called on success
      // because iOS shows its own success alert
      expect(showFileOperationAlert).not.toHaveBeenCalled();
    });

    it('shows alert after failed download', async () => {
      (downloadPayslip as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Download failed',
      });

      renderWithProvider();

      const downloadButton = screen.getByText('Download Payslip');
      fireEvent.press(downloadButton);

      await waitFor(() => {
        expect(showFileOperationAlert).toHaveBeenCalledWith(
          { success: false, error: 'Download failed' },
          'Download'
        );
      });
    });
  });

  describe('preview functionality', () => {
    it('preview button is enabled by default', () => {
      renderWithProvider();

      const previewButton = screen.getByLabelText('Preview payslip');
      expect(previewButton.props.accessibilityState?.disabled).toBeFalsy();
    });

    it('calls previewPayslip when preview button is pressed', async () => {
      renderWithProvider();

      const previewButton = screen.getByText('Preview Payslip');
      fireEvent.press(previewButton);

      await waitFor(() => {
        expect(previewPayslip).toHaveBeenCalledTimes(1);
      });
    });

    it('passes the correct payslip to previewPayslip', async () => {
      renderWithProvider();

      const previewButton = screen.getByText('Preview Payslip');
      fireEvent.press(previewButton);

      await waitFor(() => {
        expect(previewPayslip).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'PS-2024-001' }),
          false
        );
      });
    });
  });

  describe('accessibility', () => {
    it('download button has correct accessibility label', () => {
      renderWithProvider();

      expect(screen.getByLabelText('Download payslip')).toBeTruthy();
    });

    it('download button has correct accessibility hint', () => {
      renderWithProvider();

      expect(screen.getByHintText('Saves the payslip to your device')).toBeTruthy();
    });

    it('preview button has correct accessibility label', () => {
      renderWithProvider();

      expect(screen.getByLabelText('Preview payslip')).toBeTruthy();
    });

    it('preview button has correct accessibility hint', () => {
      renderWithProvider();

      expect(screen.getByHintText('Opens the payslip in a viewer')).toBeTruthy();
    });
  });

  describe('detail labels', () => {
    it('renders ID label', () => {
      renderWithProvider();

      expect(screen.getByText('ID')).toBeTruthy();
    });

    it('renders From Date label', () => {
      renderWithProvider();

      expect(screen.getByText('From Date')).toBeTruthy();
    });

    it('renders To Date label', () => {
      renderWithProvider();

      expect(screen.getByText('To Date')).toBeTruthy();
    });

    it('renders File Type label', () => {
      renderWithProvider();

      expect(screen.getByText('File Type')).toBeTruthy();
    });
  });
});

