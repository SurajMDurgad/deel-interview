import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePayslips } from '@/src/context/PayslipContext';
import {
  downloadPayslip,
  previewPayslip,
  showFileOperationAlert,
} from '@/src/services/fileService';
import { formatDate, formatPeriod } from '@/src/utils/dateUtils';

export default function PayslipDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { getPayslipById } = usePayslips();
  const payslip = id ? getPayslipById(id) : undefined;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!payslip || isDownloading) return;

    setIsDownloading(true);
    try {
      // Force re-download to replace any old cached files
      // On iOS, the download function shows its own alert with option to open Files app
      // On Android, it opens folder picker and saves there
      const result = await downloadPayslip(payslip, true);
      // Only show alert if it failed (iOS shows its own success alert)
      if (!result.success) {
        showFileOperationAlert(result, 'Download');
      }
    } finally {
      setIsDownloading(false);
    }
  }, [payslip, isDownloading]);

  const handlePreview = useCallback(async () => {
    if (!payslip || isPreviewing) return;

    setIsPreviewing(true);
    try {
      // previewPayslip will download the file if needed, then open share sheet on Android
      // This allows the user to save to a folder, open with a viewer, or share
      const result = await previewPayslip(payslip, false);
      if (!result.success) {
        showFileOperationAlert(result, 'Preview');
      }
    } finally {
      setIsPreviewing(false);
    }
  }, [payslip, isPreviewing]);

  if (!payslip) {
    return (
      <View
          style={[
            styles.container,
            styles.centerContent,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.errorIcon]}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Payslip Not Found
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.icon }]}>
            The requested payslip could not be found
          </Text>
        </View>
    );
  }

  return (
    <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* Header Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#ffffff',
              borderColor: colorScheme === 'dark' ? '#2d3135' : '#e8e8e8',
            },
          ]}
        >
          <View style={styles.headerRow}>
            {/* File type badge */}
            <View
              style={[
                styles.fileTypeBadge,
                {
                  backgroundColor:
                    payslip.file.type === 'pdf' ? '#dc3545' : '#28a745',
                },
              ]}
            >
              <Text style={styles.fileTypeBadgeText}>
                {payslip.file.type.toUpperCase()}
              </Text>
            </View>

          </View>

          {/* Period */}
          <Text style={[styles.periodText, { color: colors.text }]}>
            {formatPeriod(payslip.fromDate, payslip.toDate)}
          </Text>
        </View>

        {/* Details Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#ffffff',
              borderColor: colorScheme === 'dark' ? '#2d3135' : '#e8e8e8',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>ID</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {payslip.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>
              From Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(payslip.fromDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>
              To Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(payslip.toDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.icon }]}>
              File Type
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {payslip.file.type === 'pdf' ? 'PDF Document' : 'Image'}
            </Text>
          </View>
        </View>

        {/* Actions Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#ffffff',
              borderColor: colorScheme === 'dark' ? '#2d3135' : '#e8e8e8',
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Actions
          </Text>

          {/* Download Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.tint },
              pressed && styles.actionButtonPressed,
              isDownloading && styles.actionButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}
            accessibilityRole="button"
            accessibilityLabel="Download payslip"
            accessibilityHint="Saves the payslip to your device"
          >
            {isDownloading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>⬇️</Text>
                <Text style={styles.actionButtonText}>
                  Download Payslip
                </Text>
              </>
            )}
          </Pressable>

          {/* Preview Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonSecondary,
              {
                borderColor: colors.tint,
                backgroundColor: pressed
                  ? colorScheme === 'dark'
                    ? '#2d3135'
                    : '#f5f5f5'
                  : 'transparent',
              },
              isPreviewing && styles.actionButtonDisabled,
            ]}
            onPress={handlePreview}
            disabled={isPreviewing}
            accessibilityRole="button"
            accessibilityLabel="Preview payslip"
            accessibilityHint="Opens the payslip in a viewer"
          >
            {isPreviewing ? (
              <ActivityIndicator color={colors.tint} size="small" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>👁️</Text>
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: colors.tint },
                  ]}
                >
                  Preview Payslip
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fileTypeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  periodText: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

