import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { colors, radius, spacing } from '../theme/colors';

const COL_WIDTH = 150;
const ROW_HEIGHT = 46;

export default function PreviewScreen() {
  const { headers, entries, updateEntry, deleteEntry } = useData();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [editEntry, setEditEntry] = useState(null); // {id, values}
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.trim().toLowerCase();
    return entries.filter((entry) =>
      headers.some((h) => String(entry.values[h.id] || '').toLowerCase().includes(q))
    );
  }, [entries, headers, search]);

  const handleRowPress = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const openEdit = () => {
    const entry = entries.find((e) => e.id === selectedId);
    if (!entry) return;
    setEditEntry({ id: entry.id, values: { ...entry.values } });
  };

  const saveEdit = () => {
    if (!editEntry) return;
    updateEntry(editEntry.id, editEntry.values);
    setEditEntry(null);
  };

  const confirmDelete = () => {
    if (!confirmDeleteId) return;
    deleteEntry(confirmDeleteId);
    if (selectedId === confirmDeleteId) setSelectedId(null);
    setConfirmDeleteId(null);
  };

  if (headers.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>Nothing to preview yet</Text>
        <Text style={styles.emptyText}>
          Create headers and submit entries on the Home tab to see them here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search all columns..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Action bar */}
      {selectedId && (
        <View style={styles.actionBar}>
          <Text style={styles.actionBarText}>1 row selected</Text>
          <View style={styles.actionButtons}>
            <Pressable style={[styles.smallBtn, styles.editBtn]} onPress={openEdit}>
              <Text style={styles.smallBtnText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.smallBtn, styles.deleteBtn]}
              onPress={() => setConfirmDeleteId(selectedId)}
            >
              <Text style={styles.smallBtnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Spreadsheet table */}
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.horizontalScroll}>
        <View>
          {/* Header row */}
          <View style={styles.headerRow}>
            {headers.map((h) => (
              <View key={h.id} style={[styles.cell, styles.headerCell, { width: COL_WIDTH }]}>
                <Text style={styles.headerCellText} numberOfLines={1}>
                  {h.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          <ScrollView showsVerticalScrollIndicator style={styles.verticalScroll}>
            {filteredEntries.length === 0 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No matching records</Text>
              </View>
            ) : (
              filteredEntries.map((entry, idx) => {
                const isSelected = selectedId === entry.id;
                return (
                  <Pressable
                    key={entry.id}
                    onPress={() => handleRowPress(entry.id)}
                    style={[
                      styles.dataRow,
                      idx % 2 === 1 && styles.dataRowAlt,
                      isSelected && styles.dataRowSelected,
                    ]}
                  >
                    {headers.map((h) => (
                      <View key={h.id} style={[styles.cell, { width: COL_WIDTH }]}>
                        <Text style={styles.cellText} numberOfLines={1}>
                          {entry.values[h.id] || ''}
                        </Text>
                      </View>
                    ))}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={!!editEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setEditEntry(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.editBackdrop}
        >
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Edit Record</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {editEntry &&
                headers.map((h) => (
                  <View key={h.id} style={styles.editFieldGroup}>
                    <Text style={styles.editFieldLabel}>{h.name}</Text>
                    <TextInput
                      style={styles.editFieldInput}
                      value={editEntry.values[h.id] || ''}
                      onChangeText={(v) =>
                        setEditEntry((prev) => ({
                          ...prev,
                          values: { ...prev.values, [h.id]: v },
                        }))
                      }
                    />
                  </View>
                ))}
            </ScrollView>
            <View style={styles.editRow}>
              <Pressable
                style={[styles.smallBtn, styles.cancelBtn]}
                onPress={() => setEditEntry(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.saveBtn]} onPress={saveEdit}>
                <Text style={styles.smallBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ConfirmDialog
        visible={!!confirmDeleteId}
        title="Delete this record?"
        message="This record will be permanently removed from your dataset."
        confirmLabel="Delete"
        danger
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchWrap: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  actionBarText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  editBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.danger },
  saveBtn: { backgroundColor: colors.primary },
  cancelBtn: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  cancelBtnText: { color: colors.textSecondary, fontWeight: '700', fontSize: 12 },
  horizontalScroll: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  verticalScroll: {
    maxHeight: 500,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
  },
  headerCell: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  headerCellText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  cell: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cellText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataRowAlt: {
    backgroundColor: colors.background,
  },
  dataRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyEmoji: { fontSize: 36, marginBottom: spacing.sm },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  editBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  editCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  editFieldGroup: {
    marginBottom: spacing.md,
  },
  editFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  editFieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
