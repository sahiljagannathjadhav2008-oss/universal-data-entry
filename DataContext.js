import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@universal_data_entry_v1';
const DataContext = createContext(null);

// Simple unique id generator (no external deps needed)
const genId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export function DataProvider({ children }) {
  const [title, setTitle] = useState('');
  const [headers, setHeaders] = useState([]); // [{id, name}]
  const [entries, setEntries] = useState([]); // [{id, values: {headerId: value}}]
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef(null);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setTitle(parsed.title || '');
          setHeaders(parsed.headers || []);
          setEntries(parsed.entries || []);
        }
      } catch (e) {
        console.warn('Failed to load saved data', e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Debounced persistence whenever state changes
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ title, headers, entries })
      ).catch((e) => console.warn('Failed to save data', e));
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [title, headers, entries, hydrated]);

  const addHeader = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Header name cannot be empty' };
    const exists = headers.some(
      (h) => h.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { ok: false, error: 'A header with this name already exists' };
    setHeaders((prev) => [...prev, { id: genId(), name: trimmed }]);
    return { ok: true };
  }, [headers]);

  const removeHeader = useCallback((headerId) => {
    setHeaders((prev) => prev.filter((h) => h.id !== headerId));
    setEntries((prev) =>
      prev.map((e) => {
        const values = { ...e.values };
        delete values[headerId];
        return { ...e, values };
      })
    );
  }, []);

  const addEntry = useCallback((values) => {
    setEntries((prev) => [...prev, { id: genId(), values }]);
  }, []);

  const updateEntry = useCallback((entryId, values) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, values } : e))
    );
  }, []);

  const deleteEntry = useCallback((entryId) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }, []);

  const clearAllData = useCallback(async () => {
    setTitle('');
    setHeaders([]);
    setEntries([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear storage', e);
    }
  }, []);

  const value = {
    title,
    setTitle,
    headers,
    entries,
    addHeader,
    removeHeader,
    addEntry,
    updateEntry,
    deleteEntry,
    clearAllData,
    hydrated,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
