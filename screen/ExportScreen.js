import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportExcel, exportPDF, exportJSON } from '../utils/exportUtils';
import { colors, radius, spacing } from '../theme/colors';

const EXPORTERS = [
  { key: 'xlsx', label: 'Export Excel (.xlsx)', icon: '📗', fn: exportExcel },
  { key: 'pdf', label: 'Export PDF (.pdf)', icon: '📕', fn: exportPDF },
  { key: 'json', label: 'Export JSON (.json)', icon: '🗂️', fn: exportJSON },
];

export default function ExportScreen() {
  const { title, headers, entries, clearAllData } = useData();
  const [loadingKey, setLoadingKey] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0); // 0 = none, 1 = first, 2 = second
  const [successVisible, setSuccessVisible] = useState(false);

  const handleExport = async (exporter) => {
    setLoadingKey(exporter.key);
    try {
      await exporter.fn(title, headers, entries);
    } catch (e) {
      Alert.alert('Export failed', e.message || 'Something went wrong while exporting.');
    } finally {
      setLoadingKey(null);
    }
  };

  const handleClearAll = async () => {
    await clearAllData();
    setConfirmStep(0);
    setSuccessVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Export Dataset</Text>
      <Text style={styles.sectionSubtitle}>
        {entries.length} record{entries.length === 1 ? '' : 's'} · {headers.length} field
        {headers.length === 1 ? '' : 's'}
      </Text>

      <View style={styles.buttonStack}>
        {EXPORTERS.map((exporter) => (
          <Pressable
            key={exporter.key}
            style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
            onPress={() => handleExport(exporter)}
            disabled={loadingKey !== null}
          >
            <Text style={styles.exportIcon}>{exporter.icon}</Text>
            <Text style={styles.exportLabel}>{exporter.label}</Text>
            {loadingKey === exporter.key && (
              <ActivityIndicator color={colors.primary} style={{ marginLeft: 8 }} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Branding footer */}
      <View style={styles.brandingWrap}>
        <View style={styles.brandingDivider} />
        <Text style={styles.brandingMade}>Made by Sahil Jadhav</Text>
        <Text style={styles.brandingTag}>Built Different</Text>
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.dangerSubtitle}>
          This permanently deletes your title, headers, and all entries.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.dangerBtn, pressed && styles.pressed]}
          onPress={() => setConfirmStep(1)}
        >
          <Text style={styles.dangerBtnText}>Clear All Data</Text>
        </Pressable>
      </View>

      <ConfirmDialog
        visible={confirmStep === 1}
        title="You want to delete all data?"
        message="This will remove your project title, headers, and every entry you've created."
        confirmLabel="OK"
        onCancel={() => setConfirmStep(0)}
        onConfirm={() => setConfirmStep(2)}
      />

      <ConfirmDialog
        visible={confirmStep === 2}
        title="Are you absolutely sure?"
        message="This action cannot be undone. All entered data will be permanently deleted."
        confirmLabel="OK"
        danger
        onCancel={() => setConfirmStep(0)}
        onConfirm={handleClearAll}
      />

      <ConfirmDialog
        visible={successVisible}
        title="Done"
        message="All data cleared successfully."
        confirmLabel="OK"
        cancelLabel="Close"
        onCancel={() => setSuccessVisible(false)}
        onConfirm={() => setSuccessVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  buttonStack: {
    gap: spacing.md,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  exportIcon: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  exportLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  brandingWrap: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  brandingDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  brandingMade: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  brandingTag: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 4,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#991B1B',
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  dangerBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
