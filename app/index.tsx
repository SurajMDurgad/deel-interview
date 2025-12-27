import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { FilterInput } from '@/src/components/FilterInput';
import { PayslipCard } from '@/src/components/PayslipCard';
import { SortPicker } from '@/src/components/SortPicker';
import { usePayslips } from '@/src/context/PayslipContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Payslip } from '@/src/types/payslip';

export default function PayslipListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleTheme, isDark } = useTheme();
  const colors = Colors[colorScheme];

  const {
    filteredPayslips,
    sortOrder,
    setSortOrder,
    filterText,
    setFilterText,
  } = usePayslips();

  const handlePayslipPress = useCallback(
    (payslip: Payslip) => {
      router.push(`/payslip/${payslip.id}`);
    },
    [router]
  );

  const renderPayslipItem = useCallback(
    ({ item }: { item: Payslip }) => (
      <PayslipCard payslip={item} onPress={handlePayslipPress} />
    ),
    [handlePayslipPress]
  );

  const keyExtractor = useCallback((item: Payslip) => item.id, []);

  const ListEmptyComponent = useCallback(
    () => (
      <View 
        style={styles.emptyContainer}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`No payslips found. ${filterText ? 'Try adjusting your search terms' : 'No payslips available yet'}`}
      >
        <Text style={[styles.emptyIcon]} accessibilityElementsHidden={true}>📄</Text>
        <Text 
          style={[styles.emptyTitle, { color: colors.text }]}
          accessibilityRole="header"
        >
          No Payslips Found
        </Text>
        <Text 
          style={[styles.emptySubtitle, { color: colors.icon }]}
          accessibilityRole="text"
        >
          {filterText
            ? 'Try adjusting your search terms'
            : 'No payslips available yet'}
        </Text>
      </View>
    ),
    [colors, filterText]
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.header} accessibilityRole="none">
        <FilterInput value={filterText} onChangeText={setFilterText} />
        <View style={styles.controlsRow}>
          <SortPicker value={sortOrder} onChange={setSortOrder} />
          <Text 
            style={[styles.countText, { color: colors.icon }]}
            accessibilityRole="text"
            accessibilityLabel={`${filteredPayslips.length} ${filteredPayslips.length !== 1 ? 'payslips' : 'payslip'} found`}
            accessibilityLiveRegion="polite"
          >
            {filteredPayslips.length} payslip
            {filteredPayslips.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    ),
    [filterText, setFilterText, sortOrder, setSortOrder, filteredPayslips.length, colors]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Screen Title with Theme Toggle */}
      <View style={styles.titleContainer}>
        <Text 
          style={[styles.title, { color: colors.text }]}
          accessibilityRole="header"
        >
          Payslips
        </Text>
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.themeToggle,
            {
              backgroundColor: isDark ? '#2a2d2e' : '#f0f0f0',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          accessibilityRole="button"
          accessibilityHint={`Currently in ${isDark ? 'dark' : 'light'} mode`}
        >
          <Text style={styles.themeToggleIcon} accessibilityElementsHidden={true}>
            {isDark ? '☀️' : '🌙'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredPayslips}
        renderItem={renderPayslipItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggleIcon: {
    fontSize: 22,
  },
  header: {
    marginBottom: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  countText: {
    fontSize: 13,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
