import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReduceMotion } from 'react-native-reanimated';

interface AccessibilityPreferences {
  fontSizeMultiplier: number;
  highContrast: boolean;
  reduceMotion: boolean;
  largeTouchTargets: boolean;
  imageDescriptions: boolean;
}

interface AccessibilityContextData extends AccessibilityPreferences {
  setFontSizeMultiplier: (val: number) => void;
  setHighContrast: (val: boolean) => void;
  setReduceMotion: (val: boolean) => void;
  setLargeTouchTargets: (val: boolean) => void;
  setImageDescriptions: (val: boolean) => void;
  reanimatedReduceMotion: ReduceMotion;
}

const defaultPreferences: AccessibilityPreferences = {
  fontSizeMultiplier: 1,
  highContrast: false,
  reduceMotion: false,
  largeTouchTargets: false,
  imageDescriptions: false,
};

const AccessibilityContext = createContext<AccessibilityContextData | undefined>(undefined);

const ASYNC_STORAGE_KEY = '@agora_accessibility_prefs';

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadPrefs() {
      try {
        const stored = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch (e) {

      } finally {
        setIsLoaded(true);
      }
    }
    loadPrefs();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
    }
  }, [prefs, isLoaded]);

  const updatePref = (key: keyof AccessibilityPreferences, value: any) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const reanimatedReduceMotion = prefs.reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  if (!isLoaded) return null;

  return (
    <AccessibilityContext.Provider
      value={{
        ...prefs,
        setFontSizeMultiplier: (val) => updatePref('fontSizeMultiplier', val),
        setHighContrast: (val) => updatePref('highContrast', val),
        setReduceMotion: (val) => updatePref('reduceMotion', val),
        setLargeTouchTargets: (val) => updatePref('largeTouchTargets', val),
        setImageDescriptions: (val) => updatePref('imageDescriptions', val),
        reanimatedReduceMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
}
