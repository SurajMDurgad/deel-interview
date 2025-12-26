// Jest setup file for React Native testing

// Import jest-native matchers
import '@testing-library/react-native';


// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

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

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

// Mock file service
jest.mock('@/src/services/fileService', () => ({
  downloadPayslip: jest.fn().mockResolvedValue({ success: true }),
  previewPayslip: jest.fn().mockResolvedValue({ success: true }),
  showFileOperationAlert: jest.fn(),
}));
