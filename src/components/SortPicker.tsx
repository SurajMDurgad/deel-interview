import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { SortOrder } from '../types/payslip';
import { useTheme } from '@/src/context/ThemeContext';
import { Colors } from '@/constants/theme';

interface SortPickerProps {
  value: SortOrder;
  onChange: (order: SortOrder) => void;
}

/**
 * Toggle button component for sorting payslips
 */
export function SortPicker({ value, onChange }: SortPickerProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const options: { value: SortOrder; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel={`Sort order: ${value === 'newest' ? 'Newest first' : 'Oldest first'}`}
    >
      <Text 
        style={[styles.label, { color: colors.icon }]}
        accessibilityElementsHidden={true}
      >
        Sort by:
      </Text>
      <View
        style={[
          styles.buttonGroup,
          {
            backgroundColor: colorScheme === 'dark' ? '#2d3135' : '#f0f0f0',
          },
        ]}
        accessible={false}
      >
        {options.map(option => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.button,
                isSelected && {
                  backgroundColor: colors.tint,
                },
              ]}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Sort by ${option.label}`}
              accessibilityHint={isSelected ? 'Currently selected' : 'Double tap to select'}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: isSelected
                      ? colorScheme === 'dark'
                        ? '#151718'
                        : '#ffffff'
                      : colors.text,
                  },
                ]}
                importantForAccessibility="no-hide-descendants"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    marginRight: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

