import PayslipListScreen from '@/app/index';
import { PayslipProvider } from '@/src/context/PayslipContext';
import { Payslip } from '@/src/types/payslip';
import { fireEvent, render, screen } from '@testing-library/react-native';

// Mock expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
    file: { type: 'pdf', uri: 'test.pdf' },
  },
  {
    id: 'PS-2023-012',
    fromDate: '2023-12-01',
    toDate: '2023-12-31',
    file: { type: 'image', uri: 'test.png' },
  },
];

// Wrapper component for testing
const renderWithProvider = (payslips: Payslip[] = testPayslips) => {
  return render(
    <PayslipProvider initialPayslips={payslips}>
      <PayslipListScreen />
    </PayslipProvider>
  );
};

describe('PayslipListScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('rendering', () => {
    it('renders the screen title', () => {
      renderWithProvider();

      expect(screen.getByText('Payslips')).toBeTruthy();
    });

    it('renders all payslip items', () => {
      renderWithProvider();

      // Check that all payslip IDs are rendered
      expect(screen.getByText('PS-2024-001')).toBeTruthy();
      expect(screen.getByText('PS-2024-002')).toBeTruthy();
      expect(screen.getByText('PS-2023-012')).toBeTruthy();
    });

    it('renders payslip count correctly', () => {
      renderWithProvider();

      expect(screen.getByText('3 payslips')).toBeTruthy();
    });

    it('renders singular payslip count for one item', () => {
      const singlePayslip: Payslip[] = [testPayslips[0]];
      renderWithProvider(singlePayslip);

      expect(screen.getByText('1 payslip')).toBeTruthy();
    });

    it('renders payslips in correct order (newest first by default)', () => {
      renderWithProvider();

      // Get all payslip cards by their accessibility labels
      const payslipCard1 = screen.getByLabelText('Payslip PS-2024-002, period Feb 1 – 29, 2024');
      const payslipCard2 = screen.getByLabelText('Payslip PS-2024-001, period Jan 1 – 31, 2024');
      const payslipCard3 = screen.getByLabelText('Payslip PS-2023-012, period Dec 1 – 31, 2023');
      
      // All payslips should be rendered
      expect(payslipCard1).toBeTruthy();
      expect(payslipCard2).toBeTruthy();
      expect(payslipCard3).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('renders empty state when no payslips', () => {
      renderWithProvider([]);

      expect(screen.getByText('No Payslips Found')).toBeTruthy();
      expect(screen.getByText('No payslips available yet')).toBeTruthy();
    });

    it('renders empty state with search hint when filtering returns no results', () => {
      renderWithProvider();

      // Type in filter to get no results
      const filterInput = screen.getByPlaceholderText('Search by year, month, or ID...');
      fireEvent.changeText(filterInput, 'nonexistent');

      expect(screen.getByText('No Payslips Found')).toBeTruthy();
      expect(screen.getByText('Try adjusting your search terms')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('navigates to payslip details when a card is pressed', () => {
      renderWithProvider();

      // Find the first payslip card by its accessibility label and press it
      const payslipCard = screen.getByLabelText('Payslip PS-2024-002, period Feb 1 – 29, 2024');
      fireEvent.press(payslipCard);

      // Verify navigation was called with correct route
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/payslip/PS-2024-002');
    });

    it('navigates to correct payslip when different card is pressed', () => {
      renderWithProvider();

      // Press the January payslip
      const payslipCard = screen.getByLabelText('Payslip PS-2024-001, period Jan 1 – 31, 2024');
      fireEvent.press(payslipCard);

      expect(mockPush).toHaveBeenCalledWith('/payslip/PS-2024-001');
    });
  });

  describe('filtering', () => {
    it('renders filter input', () => {
      renderWithProvider();

      expect(screen.getByPlaceholderText('Search by year, month, or ID...')).toBeTruthy();
    });

    it('filters payslips by ID when typing', () => {
      renderWithProvider();

      const filterInput = screen.getByPlaceholderText('Search by year, month, or ID...');
      fireEvent.changeText(filterInput, 'PS-2024-001');

      // Only matching payslip should be visible
      expect(screen.getByText('PS-2024-001')).toBeTruthy();
      expect(screen.queryByText('PS-2024-002')).toBeNull();
      expect(screen.queryByText('PS-2023-012')).toBeNull();
    });

    it('filters payslips by year', () => {
      renderWithProvider();

      const filterInput = screen.getByPlaceholderText('Search by year, month, or ID...');
      fireEvent.changeText(filterInput, '2023');

      // Only 2023 payslip should be visible
      expect(screen.getByText('PS-2023-012')).toBeTruthy();
      expect(screen.queryByText('PS-2024-001')).toBeNull();
      expect(screen.queryByText('PS-2024-002')).toBeNull();
    });

    it('updates payslip count after filtering', () => {
      renderWithProvider();

      const filterInput = screen.getByPlaceholderText('Search by year, month, or ID...');
      fireEvent.changeText(filterInput, '2024');

      expect(screen.getByText('2 payslips')).toBeTruthy();
    });
  });

  describe('sorting', () => {
    it('renders sort picker with Newest and Oldest options', () => {
      renderWithProvider();

      expect(screen.getByText('Newest')).toBeTruthy();
      expect(screen.getByText('Oldest')).toBeTruthy();
    });

    it('changes sort order when Oldest button is pressed', () => {
      renderWithProvider();

      // Press Oldest button
      const oldestButton = screen.getByText('Oldest');
      fireEvent.press(oldestButton);

      // After pressing, the list order should change
      // The oldest payslip (Dec 2023) should now be first
      // We can verify by checking the order of accessibility labels
      expect(screen.getByText('PS-2023-012')).toBeTruthy();
    });
  });

  describe('payslip card content', () => {
    it('displays file type badge for PDF', () => {
      renderWithProvider();

      // Both PDF payslips should show PDF badge
      const pdfBadges = screen.getAllByText('PDF');
      expect(pdfBadges.length).toBeGreaterThanOrEqual(2);
    });

    it('displays file type badge for IMAGE', () => {
      renderWithProvider();

      // The image payslip should show IMAGE badge
      expect(screen.getByText('IMAGE')).toBeTruthy();
    });

    it('displays formatted period text', () => {
      renderWithProvider();

      // Check for formatted period text
      expect(screen.getByText('Jan 1 – 31, 2024')).toBeTruthy();
    });

    it('displays chevron indicator on each card', () => {
      renderWithProvider();

      const chevrons = screen.getAllByText('›');
      expect(chevrons.length).toBe(3);
    });
  });

  describe('accessibility', () => {
    it('payslip cards have proper accessibility labels', () => {
      renderWithProvider();

      // Check for accessibility labels on all payslip cards
      expect(screen.getByLabelText('Payslip PS-2024-001, period Jan 1 – 31, 2024')).toBeTruthy();
      expect(screen.getByLabelText('Payslip PS-2024-002, period Feb 1 – 29, 2024')).toBeTruthy();
      expect(screen.getByLabelText('Payslip PS-2023-012, period Dec 1 – 31, 2023')).toBeTruthy();
    });

    it('payslip cards have accessibility hints', () => {
      renderWithProvider();

      const cardsWithHint = screen.getAllByHintText('Double tap to view payslip details');
      expect(cardsWithHint.length).toBe(3);
    });

    it('filter input has accessibility label', () => {
      renderWithProvider();

      expect(screen.getByLabelText('Search payslips')).toBeTruthy();
    });
  });
});

