import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePayslips } from '@/src/context/PayslipContext';
import { PayslipCard } from '@/src/components/PayslipCard';
import { SortPicker } from '@/src/components/SortPicker';
import { FilterInput } from '@/src/components/FilterInput';
import { Payslip } from '@/src/types/payslip';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function PayslipListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
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
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon]}>📄</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Payslips Found
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
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
      <View style={styles.header}>
        <FilterInput value={filterText} onChangeText={setFilterText} />
        <View style={styles.controlsRow}>
          <SortPicker value={sortOrder} onChange={setSortOrder} />
          <Text style={[styles.countText, { color: colors.icon }]}>
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
      {/* Screen Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Payslips</Text>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
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

