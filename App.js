import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { DataProvider } from './context/DataContext';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import PreviewScreen from './screens/PreviewScreen';
import ExportScreen from './screens/ExportScreen';
import { colors } from './theme/colors';

const SCREENS = {
  Home: HomeScreen,
  Preview: PreviewScreen,
  Export: ExportScreen,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const ActiveScreen = SCREENS[activeTab];

  return (
    <SafeAreaProvider>
      <DataProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar style="dark" />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Universal Data Entry</Text>
          </View>
          <View style={styles.content}>
            <ActiveScreen />
          </View>
        </SafeAreaView>
        <SafeAreaView style={styles.navSafeArea} edges={['bottom']}>
          <BottomNav active={activeTab} onChange={setActiveTab} />
        </SafeAreaView>
      </DataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navSafeArea: {
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
