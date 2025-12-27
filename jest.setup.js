// Jest setup file for React Native testing

// Import jest-native matchers
import '@testing-library/react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);


// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: () => null,
  },
  Link: ({ children }) => children,
}));

// Mock ThemeContext
jest.mock('@/src/context/ThemeContext', () => ({
  useTheme: () => ({
    themeMode: 'light',
    colorScheme: 'light',
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock file service
jest.mock('@/src/services/fileService', () => ({
  downloadPayslip: jest.fn().mockResolvedValue({ success: true }),
  previewPayslip: jest.fn().mockResolvedValue({ success: true }),
  showFileOperationAlert: jest.fn(),
}));
