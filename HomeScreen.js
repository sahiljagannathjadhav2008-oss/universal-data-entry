import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useData } from '../context/DataContext';
import AddHeaderModal from '../components/AddHeaderModal';
import { colors, radius, spacing } from '../theme/colors';

export default function HomeScreen() {
  const { title, setTitle, headers, entries, addHeader, removeHeader, addEntry } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState({});

  const handleFieldChange = (headerId, value) => {
    setFormValues((prev) => ({ ...prev, [headerId]: value }));
  };

  const handleSubmit = () => {
    if (headers.length === 0) {
      Alert.alert('No headers yet', 'Add at least one header before creating a record.');
      return;
    }
    addEntry(formValues);
    setFormValues({});
  };

  const handleRemoveHeader = (headerId, name) => {
    Alert.alert(
      'Remove header?',
      `"${name}" will be removed from the form and all existing records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeHeader(headerId) },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Section */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleInputWrap}>
              <Text style={styles.smallLabel}>Project Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Customer Records"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View style={styles.counterBox}>
              <Text style={styles.counterNumber}>{entries.length}</Text>
              <Text style={styles.counterLabel}>Entries</Text>
            </View>
          </View>
        </View>

        {/* Headers Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Form Fields</Text>
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </Pressable>
        </View>

        {headers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No fields yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button above to create your first custom header (e.g. Name, Mobile Number, Amount).
            </Text>
          </View>
        ) : (
          <View style={styles.formCard}>
            {headers.map((header) => (
              <View key={header.id} style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{header.name}</Text>
                  <Pressable onPress={() => handleRemoveHeader(header.id, header.name)} hitSlop={10}>
                    <Text style={styles.removeHeaderText}>Remove</Text>
                  </Pressable>
                </View>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={`Enter ${header.name.toLowerCase()}`}
                  placeholderTextColor={colors.textMuted}
                  value={formValues[header.id] || ''}
                  onChangeText={(v) => handleFieldChange(header.id, v)}
                />
              </View>
            ))}

            <Pressable
              style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Submit Entry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <AddHeaderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={addHeader}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  titleInputWrap: { flex: 1 },
  smallLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 6,
  },
  counterBox: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 64,
  },
  counterNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  counterLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: -2,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.xxl,
  },
  emptyEmoji: { fontSize: 32, marginBottom: spacing.sm },
  emptyTitle: {
    fontSize: 15,
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
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  removeHeaderText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
