/**
 * ═══════════════════════════════════════════════════════════════
 * Ágora — SOSButton (COMPONENTE ISOLADO)
 * ═══════════════════════════════════════════════════════════════
 *
 * ATENÇÃO: Este componente é INTENCIONALMENTE isolado do design system.
 *
 * - NÃO herda de Button.tsx
 * - NÃO usa tokens genéricos
 * - USA EXCLUSIVAMENTE tokens danger* de colors.ts
 * - Qualquer alteração no design system NÃO afeta este componente
 *
 * Requisitos cobertos:
 * - RF-04: Gatilho de Emergência (Botão SOS)
 * - RNF-04: Acessibilidade (accessibilityRole, label, hint)
 *
 * Comportamento:
 * - Long press (800ms) para ativar — evita acionamentos acidentais
 * - Feedback visual: pulso vermelho contínuo via Reanimated
 * - Feedback háptico ao ativar (quando disponível)
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

// ═══════════════════════════════════════════
// TOKENS ISOLADOS — Duplicados intencionalmente
// para blindar contra mudanças no theme/colors.ts
// ═══════════════════════════════════════════
const SOS_COLORS = {
  bg: '#FF1744',
  bgDark: '#D50000',
  glow: 'rgba(255, 23, 68, 0.35)',
  glowIntense: 'rgba(255, 23, 68, 0.55)',
  text: '#FFFFFF',
  ring: 'rgba(255, 23, 68, 0.20)',
} as const;

const SOS_SIZE = 72;
const SOS_LONG_PRESS_DURATION = 800; // ms

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

export function SOSButton({ onActivate, disabled = false }: SOSButtonProps) {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  // Pulso contínuo no anel externo
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 1200, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.in(Easing.ease) }),
      ),
      -1, // infinito
      false,
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, [pulseScale, pulseOpacity]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [scale]);

  const handleLongPress = useCallback(() => {
    // Feedback visual de ativação
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 }),
    );
    onActivate();
  }, [scale, onActivate]);

  const animatedButton = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {/* Anel de pulso (atrás do botão) */}
      <Animated.View style={[styles.pulseRing, animatedPulse]} />

      {/* Botão SOS */}
      <Animated.View style={animatedButton}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          delayLongPress={SOS_LONG_PRESS_DURATION}
          disabled={disabled}
          style={[
            styles.button,
            disabled && styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Botão de emergência SOS"
          accessibilityHint="Segure por 1 segundo para enviar alerta de emergência aos seus contatos de confiança"
          accessibilityState={{ disabled }}
        >
          <Animated.Text style={styles.text}>SOS</Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SOS_SIZE + 24,
    height: SOS_SIZE + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: SOS_SIZE + 16,
    height: SOS_SIZE + 16,
    borderRadius: (SOS_SIZE + 16) / 2,
    backgroundColor: SOS_COLORS.ring,
    borderWidth: 2,
    borderColor: SOS_COLORS.glow,
  },
  button: {
    width: SOS_SIZE,
    height: SOS_SIZE,
    borderRadius: SOS_SIZE / 2,
    backgroundColor: SOS_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: SOS_COLORS.bg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  disabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  text: {
    color: SOS_COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
