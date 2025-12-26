import React from 'react';
import { StyleSheet, View, TextInput, Pressable, Text } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { Colors } from '@/constants/theme';

interface FilterInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

/**
 * Search/filter input component
 */
export function FilterInput({
  value,
  onChangeText,
  placeholder = 'Search by year, month, or ID...',
}: FilterInputProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colorScheme === 'dark' ? '#2d3135' : '#f5f5f5',
            borderColor: colorScheme === 'dark' ? '#3d4145' : '#e0e0e0',
          },
        ]}
      >
        {/* Search icon */}
        <Text style={[styles.searchIcon, { color: colors.icon }]}>🔍</Text>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          accessibilityLabel="Search payslips"
          accessibilityHint="Enter text to filter payslips by year, month, or ID"
        />

        {/* Clear button */}
        {value.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <View
              style={[
                styles.clearIcon,
                { backgroundColor: colors.icon },
              ]}
            >
              <Text style={styles.clearIconText}>×</Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIconText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
  },
});

