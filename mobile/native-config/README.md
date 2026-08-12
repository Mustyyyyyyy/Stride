# Native Configuration for Stride Mobile

## Android Permissions

Once you have initialized the native Android project (`android/` folder), add these permissions to `android/app/src/main/AndroidManifest.xml` inside the `<manifest>` tag:

```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

Also add a foreground service declaration inside `<application>`:

```xml
<service
  android:name=".services.StepCounterForegroundService"
  android:exported="false"
  android:foregroundServiceType="health|location" />
```

## iOS Permissions

Once you have initialized the native iOS project (`ios/` folder), add these keys to `ios/Stride/Info.plist`:

```xml
<key>NSMotionUsageDescription</key>
<string>Stride needs access to motion data to count your steps accurately.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Stride needs location access to track your workouts on the map.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Stride needs location access to track your workouts in the background.</string>
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
  <string>processing</string>
</array>
```

## Foreground Service (Android)

For reliable background step counting on Android, create a foreground service at `android/app/src/main/java/com/stride/mobile/services/StepCounterForegroundService.java`:

```java
package com.stride.mobile.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

public class StepCounterForegroundService extends Service {
  private static final String CHANNEL_ID = "StrideStepCounterChannel";
  private static final int NOTIFICATION_ID = 1001;

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Stride Step Counter")
      .setContentText("Tracking your steps in background")
      .setSmallIcon(android.R.drawable.ic_dialog_info)
      .build();
    startForeground(NOTIFICATION_ID, notification);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    return START_STICKY;
  }

  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "Step Counter",
        NotificationManager.IMPORTANCE_LOW
      );
      NotificationManager manager = getSystemService(NotificationManager.class);
      if (manager != null) manager.createNotificationChannel(channel);
    }
  }
}
```

Register the service in `android/app/src/main/AndroidManifest.xml`:

```xml
<service
  android:name=".services.StepCounterForegroundService"
  android:exported="false"
  android:foregroundServiceType="health|location" />
```
