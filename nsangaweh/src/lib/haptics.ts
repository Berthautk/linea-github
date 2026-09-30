/**
 * Safe haptic feedback using Web Vibration API for a native-like tactile feel
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([40, 40, 40]);
        break;
    }
  } catch {
    // Ignore errors on devices without vibration support or when blocked by browser
  }
}
