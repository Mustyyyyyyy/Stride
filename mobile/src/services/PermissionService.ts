import { Platform, PermissionsAndroid, Alert } from 'react-native';

class PermissionService {
  async checkActivityRecognition(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);
      return granted;
    } catch {
      return false;
    }
  }

  async checkLocation(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return granted;
    } catch {
      return false;
    }
  }

  async checkNotification(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return granted;
    } catch {
      return false;
    }
  }

  async requestActivityRecognition(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Step Counter Permission',
          message: 'Stride needs access to your physical activity to count steps in the background.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  async requestLocation(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Stride needs access to your location for GPS tracking during workouts.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  async requestNotification(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'Stride needs permission to show notifications during tracking.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  async requestAllPermissions(): Promise<{ activity: boolean; location: boolean; notification: boolean }> {
    const [activity, location, notification] = await Promise.all([
      this.requestActivityRecognition(),
      this.requestLocation(),
      this.requestNotification(),
    ]);

    if (!activity || !location) {
      Alert.alert(
        'Permissions Required',
        'Stride needs activity and location permissions to track your workouts accurately. Please enable them in Settings.',
        [{ text: 'OK' }]
      );
    }

    return { activity, location, notification };
  }
}

export const permissionService = new PermissionService();
