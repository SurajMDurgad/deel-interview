import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { Payslip } from '../types/payslip';
import { formatPeriod } from '../utils/dateUtils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PayslipCardProps {
  payslip: Payslip;
  onPress: (payslip: Payslip) => void;
}

/**
 * Card component displaying a payslip summary
 */
export function PayslipCard({ payslip, onPress }: PayslipCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePress = () => {
    onPress(payslip);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#ffffff',
          borderColor: colorScheme === 'dark' ? '#2d3135' : '#e8e8e8',
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Payslip ${payslip.id}, period ${formatPeriod(payslip.fromDate, payslip.toDate)}`}
      accessibilityHint="Double tap to view payslip details"
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {/* File type indicator */}
          <View
            style={[
              styles.fileTypeIndicator,
              { backgroundColor: payslip.file.type === 'pdf' ? '#dc3545' : '#28a745' },
            ]}
          >
            <Text style={styles.fileTypeText}>
              {payslip.file.type.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Period */}
          <Text style={[styles.periodText, { color: colors.text }]}>
            {formatPeriod(payslip.fromDate, payslip.toDate)}
          </Text>

          {/* ID */}
          <Text style={[styles.idText, { color: colors.icon }]}>
            {payslip.id}
          </Text>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Text style={[styles.chevron, { color: colors.icon }]}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    marginRight: 12,
  },
  fileTypeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  fileTypeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  idText: {
    fontSize: 13,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});

