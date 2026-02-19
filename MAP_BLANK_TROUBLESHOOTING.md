# Map Blank Screen - Troubleshooting Guide

## Current Status
✅ Map initializes correctly (logs show "Map is ready")
✅ Region is set correctly
✅ Pickup location is set
✅ No loading overlay blocking
❌ Map tiles are not loading (blank screen)

## Possible Causes & Solutions

### 1. **App Needs Rebuild** ⚠️ MOST LIKELY
The native Android app needs to be rebuilt after adding/changing the API key.

**Solution:**
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android

# OR if using EAS
eas build --platform android --profile development
```

### 2. **API Key Permissions**
Check Google Cloud Console:
- ✅ Maps SDK for Android enabled
- ✅ Directions API enabled  
- ✅ Geocoding API enabled
- ✅ Places API enabled
- ⚠️ API key restrictions allow your package name: `com.crashingout.kablux`

### 3. **API Key in AndroidManifest.xml**
Verify the API key is correct:
```bash
# Check AndroidManifest.xml
cat android/app/src/main/AndroidManifest.xml | grep API_KEY
```

Should show:
```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="AIzaSyD5mNdwJg_TARwAw6OugmUFCo2_mnUTKqI"/>
```

### 4. **Test API Key Directly**
Test if the API key works:
```bash
# Test Directions API
curl "https://maps.googleapis.com/maps/api/directions/json?origin=6.5244,3.3792&destination=6.5244,3.3792&key=AIzaSyD5mNdwJg_TARwAw6OugmUFCo2_mnUTKqI"
```

### 5. **Check Logcat for Errors**
```bash
adb logcat | grep -i "maps\|google\|api\|error"
```

Look for:
- API key errors
- Network errors
- Permission errors

### 6. **Temporary Test: Remove Custom Style**
Try removing `customMapStyle` temporarily to see if that's causing the issue:

In `RideMapView.tsx`, comment out:
```tsx
// customMapStyle={darkMapStyle}
```

### 7. **Check Network Connectivity**
Ensure device/emulator has internet connection.

### 8. **Verify Map Container Dimensions**
The map container should have proper dimensions. Check if parent View has `flex: 1`.

## Debugging Steps

1. **Check Console Logs:**
   - Look for "✅ Map is ready!"
   - Look for "✅ Map tiles loaded successfully"
   - Look for any "❌ Map error" messages

2. **Check if Map Container is Visible:**
   - Add temporary background color to map container
   - If background shows but map doesn't = API key issue
   - If nothing shows = container/style issue

3. **Test with Simple Map:**
   - Try rendering a basic MapView without any props except `initialRegion`
   - If that works, gradually add props back

## Next Steps

1. **Rebuild the app** - This is the most likely fix
2. **Check Google Cloud Console** - Verify API key permissions
3. **Check Logcat** - Look for specific error messages
4. **Test API key** - Verify it works with curl

---

**Most likely solution:** Run `npx expo prebuild --clean` and rebuild the app.
