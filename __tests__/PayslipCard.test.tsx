import { PayslipCard } from '@/src/components/PayslipCard';
import { Payslip } from '@/src/types/payslip';
import { fireEvent, render, screen } from '@testing-library/react-native';

describe('PayslipCard', () => {
  const mockPayslip: Payslip = {
    id: 'PS-2024-001',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
    file: { type: 'pdf', uri: 'test.pdf' },
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders payslip ID', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    expect(screen.getByText('PS-2024-001')).toBeTruthy();
  });

  it('renders formatted period text', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    // formatPeriod returns "Jan 1 – 31, 2024" for same month
    expect(screen.getByText('Jan 1 – 31, 2024')).toBeTruthy();
  });

  it('renders PDF file type indicator', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    expect(screen.getByText('PDF')).toBeTruthy();
  });

  it('renders IMAGE file type indicator for image payslip', () => {
    const imagePayslip: Payslip = {
      ...mockPayslip,
      file: { type: 'image', uri: 'test.png' },
    };

    render(<PayslipCard payslip={imagePayslip} onPress={mockOnPress} />);

    expect(screen.getByText('IMAGE')).toBeTruthy();
  });

  it('calls onPress with payslip when pressed', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    const card = screen.getByRole('button');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockPayslip);
  });

  it('has correct accessibility label', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    const card = screen.getByLabelText(
      'Payslip PS-2024-001, period Jan 1 – 31, 2024'
    );
    expect(card).toBeTruthy();
  });

  it('has correct accessibility hint', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    const card = screen.getByHintText('Double tap to view payslip details');
    expect(card).toBeTruthy();
  });

  it('renders chevron indicator', () => {
    render(<PayslipCard payslip={mockPayslip} onPress={mockOnPress} />);

    expect(screen.getByText('›')).toBeTruthy();
  });

  describe('different date ranges', () => {
    it('renders different month period correctly', () => {
      const crossMonthPayslip: Payslip = {
        id: 'PS-2024-002',
        fromDate: '2024-01-15',
        toDate: '2024-02-15',
        file: { type: 'pdf', uri: 'test.pdf' },
      };

      render(<PayslipCard payslip={crossMonthPayslip} onPress={mockOnPress} />);

      // formatPeriod returns "Jan 15 – Feb 15, 2024" for same year different month
      expect(screen.getByText('Jan 15 – Feb 15, 2024')).toBeTruthy();
    });

    it('renders different year period correctly', () => {
      const crossYearPayslip: Payslip = {
        id: 'PS-2024-001',
        fromDate: '2023-12-15',
        toDate: '2024-01-15',
        file: { type: 'pdf', uri: 'test.pdf' },
      };

      render(<PayslipCard payslip={crossYearPayslip} onPress={mockOnPress} />);

      // formatPeriod returns "Dec 15, 2023 – Jan 15, 2024" for different years
      expect(screen.getByText('Dec 15, 2023 – Jan 15, 2024')).toBeTruthy();
    });
  });
});

