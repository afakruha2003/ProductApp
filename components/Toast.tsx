import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

type ToastProps = {
  message: string;
  type?: 'success' | 'error';
  visible: boolean;
};

export default function Toast({ message, type = 'success', visible }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, message]);

  return (
    <Animated.View style={[
      styles.toast,
      type === 'error' ? styles.error : styles.success,
      { opacity },
    ]}>
      <Text style={styles.text}>
        {type === 'success' ? '✅ ' : '❌ '}{message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  success: { backgroundColor: '#1a1a2e' },
  error: { backgroundColor: '#e94560' },
  text: { color: '#fff', fontSize: 14, fontWeight: '600' },
});