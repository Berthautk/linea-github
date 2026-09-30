import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === 'granted';
  } catch {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  }
  return false;
}

export async function scheduleLocalAlert({
  id,
  title,
  body,
  scheduleAt,
}: {
  id: number;
  title: string;
  body: string;
  scheduleAt?: Date;
}) {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: scheduleAt ? { at: scheduleAt } : undefined,
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#0B6E4F',
        },
      ],
    });
  } catch {
    // Web fallback
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
      });
    }
  }
}
