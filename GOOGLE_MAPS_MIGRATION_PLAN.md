# Google Maps Migration Plan
## Replacing Mapbox with Google Directions API & Google Places API

---

## 📋 Current Implementation Analysis

### **Mapbox Components Identified:**

1. **Map Rendering**
   - `@rnmapbox/maps` library (`utils/mapbox.ts`)
   - Used in: `RideMapView.tsx`, `SetLocation.tsx`, `TrackDriver.tsx`

2. **Directions API**
   - Mapbox Directions API (`utils/mapboxDirections.ts`)
   - Returns GeoJSON geometry for route rendering

3. **Geocoding**
   - Mapbox Geocoding API (`utils/geocoding.ts`)
   - Reverse geocoding (coordinates → address)
   - Forward geocoding (address → coordinates)

4. **Places Search**
   - Mapbox Geocoding API (`components/MapboxSearch.tsx`)
   - Autocomplete search functionality
   - Used in: `SearchModal.tsx`, `PickLocation.tsx`

### **Existing Google Maps Usage:**
- ✅ `react-native-maps` already installed
- ✅ `react-native-maps-directions` already installed
- ✅ Some screens already use Google Maps (BookingScreen, PlanRideScreen, RideTrackingScreen)
- ✅ Google Maps API key already configured in `app.config.js`

---

## 🎯 Migration Strategy

### **Phase 1: Create Google Maps Utilities**
Replace Mapbox utilities with Google equivalents:

1. **`utils/googleDirections.ts`** (NEW)
   - Replace `utils/mapboxDirections.ts`
   - Use Google Directions API
   - Return polyline-encoded route or coordinate array
   - Handle distance, duration, and route geometry

2. **`utils/googleGeocoding.ts`** (NEW)
   - Replace `utils/geocoding.ts`
   - Use Google Geocoding API for reverse geocoding
   - Use Google Places API for forward geocoding

3. **`utils/googlePlaces.ts`** (NEW)
   - Replace Mapbox Places search
   - Use Google Places Autocomplete API
   - Use Google Places Details API for place details

### **Phase 2: Replace Map Components**

1. **`components/GooglePlacesSearch.tsx`** (NEW)
   - Replace `components/MapboxSearch.tsx`
   - Use Google Places Autocomplete API
   - Maintain same interface/props for easy replacement

2. **`app/Order/map/components/RideMapView.tsx`** (UPDATE)
   - Replace `@rnmapbox/maps` with `react-native-maps`
   - Replace Mapbox Directions with Google Directions
   - Update route rendering (polyline decoding)
   - Update markers and camera controls

3. **`app/Order/map/SetLocation.tsx`** (UPDATE)
   - Update to use `react-native-maps` instead of Mapbox
   - Update geocoding calls to Google APIs

4. **`app/Order/map/TrackDriver.tsx`** (UPDATE)
   - Update to use `react-native-maps`
   - Update route rendering

### **Phase 3: Update Configuration**

1. **`app.config.js`**
   - Remove `@rnmapbox/maps` plugin
   - Ensure Google Maps API key is properly configured

2. **`package.json`**
   - Remove Mapbox dependencies:
     - `@rnmapbox/maps`
     - `@mapbox/mapbox-sdk`
     - `@mapbox/polyline` (keep if needed for decoding)
   - Add if needed:
     - `@googlemaps/js-api-loader` (optional, for web)
     - `react-native-google-places-autocomplete` (already installed!)

3. **Environment Variables**
   - Remove: `EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`, `MAPBOX_DOWNLOADS_TOKEN`
   - Ensure: `EXPO_PUBLIC_GOOGLE_API_KEY` is set

---

## 📝 Detailed Implementation Plan

### **Step 1: Google Directions API Utility**

**File:** `utils/googleDirections.ts`

**Functionality:**
- Fetch route between pickup and dropoff
- Return decoded polyline coordinates
- Include distance and duration
- Handle errors gracefully

**API Endpoint:**
```
https://maps.googleapis.com/maps/api/directions/json
```

**Parameters:**
- `origin`: `{lat},{lng}`
- `destination`: `{lat},{lng}`
- `key`: Google API key
- `mode`: `driving` (default)
- `alternatives`: `false`
- `language`: `en`

**Response Format:**
- Decode polyline from `routes[0].overview_polyline.points`
- Extract `distance.value` (meters) and `duration.value` (seconds)
- Return array of `[lat, lng]` coordinates

---

### **Step 2: Google Geocoding Utility**

**File:** `utils/googleGeocoding.ts`

**Functions:**

1. **`reverseGeocode(lat, lng)`**
   - Use Google Geocoding API
   - Endpoint: `https://maps.googleapis.com/maps/api/geocode/json`
   - Return formatted address string

2. **`forwardGeocode(address)`**
   - Use Google Geocoding API
   - Return `{ latitude, longitude }`

---

### **Step 3: Google Places Search Component**

**File:** `components/GooglePlacesSearch.tsx`

**Functionality:**
- Use Google Places Autocomplete API
- Debounced search input
- Display suggestions with place name and address
- On selection, fetch place details for coordinates

**API Endpoints:**
1. Autocomplete: `https://maps.googleapis.com/maps/api/place/autocomplete/json`
2. Details: `https://maps.googleapis.com/maps/api/place/details/json`

**Props Interface:**
```typescript
interface GooglePlacesSearchProps {
    onSelectPlace: (place: {
        place_name: string;
        center: [number, number]; // [lng, lat]
        text: string;
        address: string;
    }) => void;
    apiKey: string;
}
```

**Note:** Maintain same interface as `MapboxSearch` for easy drop-in replacement.

---

### **Step 4: Update RideMapView Component**

**File:** `app/Order/map/components/RideMapView.tsx`

**Changes:**
1. Replace imports:
   - Remove: `import Mapbox from "@/utils/mapbox"`
   - Add: `import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"`

2. Replace MapView:
   - `Mapbox.MapView` → `MapView` with `provider={PROVIDER_GOOGLE}`
   - `Mapbox.Camera` → Use `MapView` `region` prop and `animateToRegion()`

3. Replace Route Rendering:
   - Remove: `Mapbox.ShapeSource` and `Mapbox.LineLayer`
   - Add: `Polyline` component with decoded coordinates
   - Style polyline with color `#f6a623` and width `4`

4. Replace Markers:
   - Remove: `Mapbox.PointAnnotation`
   - Add: `Marker` component with custom views

5. Update Directions:
   - Replace `getDirections` from `mapboxDirections` with `getDirections` from `googleDirections`
   - Decode polyline to coordinates array

---

### **Step 5: Update Other Components**

**Files to Update:**
- `app/Order/map/SetLocation.tsx` - Replace MapboxSearch with GooglePlacesSearch
- `app/Order/map/TrackDriver.tsx` - Update map component
- `app/Order/map/components/SearchModal.tsx` - Replace MapboxSearch
- `app/Order/map/components/PickLocation.tsx` - Replace MapboxSearch

**Geocoding Updates:**
- Replace all `reverseGeocode` imports from `@/utils/geocoding` to `@/utils/googleGeocoding`
- Replace all `forwardGeocode` imports

---

### **Step 6: Cleanup**

**Remove Files:**
- `utils/mapbox.ts`
- `utils/mapboxDirections.ts`
- `utils/geocoding.ts` (after migration)
- `components/MapboxSearch.tsx` (after migration)

**Update Android Build:**
- Remove Mapbox Maven repository from `android/build.gradle`
- Remove Mapbox dependencies from `android/app/build.gradle`

---

## 🔑 Required Information

### **Before Implementation, Please Provide:**

1. **Google API Key**
   - ✅ Already configured in `app.config.js` as `EXPO_PUBLIC_GOOGLE_API_KEY`
   - Confirm it has these APIs enabled:
     - ✅ Maps SDK for Android
     - ✅ Maps SDK for iOS
     - ⚠️ **Directions API** (needs to be enabled)
     - ⚠️ **Geocoding API** (needs to be enabled)
     - ⚠️ **Places API** (needs to be enabled)
     - ⚠️ **Places API (New)** - if using new Places API

2. **API Restrictions**
   - Confirm API key restrictions (if any)
   - Android package name: `com.crashingout.kablux`
   - iOS bundle identifier: (check `app.config.js`)

3. **Billing**
   - Confirm Google Cloud billing is enabled
   - Review pricing for:
     - Directions API: $5 per 1,000 requests
     - Geocoding API: $5 per 1,000 requests
     - Places API: $17 per 1,000 requests (Autocomplete)

---

## ⚠️ Important Considerations

### **API Quotas & Limits:**
- Google Places Autocomplete: 10 requests/second
- Directions API: 50 requests/second
- Geocoding API: 50 requests/second

### **Polyline Decoding:**
- Google returns encoded polylines
- Use `@mapbox/polyline` (already installed) or `@googlemaps/polyline-codec`
- Or implement simple decoder function

### **Coordinate Format:**
- Mapbox uses `[lng, lat]` (GeoJSON format)
- Google Maps uses `{lat, lng}` or `[lat, lng]`
- Need to swap coordinates in some places

### **Error Handling:**
- Handle API quota exceeded errors
- Handle network failures gracefully
- Provide fallback behavior

### **Testing:**
- Test in Nigeria (current country restriction: `country=ng`)
- Test route calculation accuracy
- Test place search accuracy
- Test geocoding accuracy

---

## 📦 Dependencies Status

### **Already Installed:**
- ✅ `react-native-maps` (v1.20.1)
- ✅ `react-native-maps-directions` (v1.9.0)
- ✅ `react-native-google-places-autocomplete` (v2.5.7)
- ✅ `@mapbox/polyline` (can be used for decoding)

### **To Remove:**
- ❌ `@rnmapbox/maps` (v10.2.10)
- ❌ `@mapbox/mapbox-sdk` (v0.16.2)
- ❌ `@mapbox/polyline` (optional - can keep for decoding)

### **To Add (if needed):**
- ⚠️ `@googlemaps/polyline-codec` (alternative to @mapbox/polyline)

---

## 🚀 Implementation Order

1. ✅ **Create Google utilities** (`googleDirections.ts`, `googleGeocoding.ts`, `googlePlaces.ts`)
2. ✅ **Create GooglePlacesSearch component**
3. ✅ **Update RideMapView component**
4. ✅ **Update SetLocation component**
5. ✅ **Update TrackDriver component**
6. ✅ **Update SearchModal and PickLocation components**
7. ✅ **Remove Mapbox dependencies**
8. ✅ **Update app.config.js**
9. ✅ **Clean up Android build files**
10. ✅ **Test thoroughly**

---

## 📊 Migration Checklist

- [ ] Google API key has Directions API enabled
- [ ] Google API key has Geocoding API enabled
- [ ] Google API key has Places API enabled
- [ ] Create `utils/googleDirections.ts`
- [ ] Create `utils/googleGeocoding.ts`
- [ ] Create `utils/googlePlaces.ts`
- [ ] Create `components/GooglePlacesSearch.tsx`
- [ ] Update `RideMapView.tsx`
- [ ] Update `SetLocation.tsx`
- [ ] Update `TrackDriver.tsx`
- [ ] Update `SearchModal.tsx`
- [ ] Update `PickLocation.tsx`
- [ ] Remove Mapbox utilities
- [ ] Remove Mapbox components
- [ ] Update `app.config.js`
- [ ] Update `package.json`
- [ ] Update Android build files
- [ ] Test route rendering
- [ ] Test place search
- [ ] Test geocoding
- [ ] Test driver tracking
- [ ] Remove Mapbox environment variables

---

## ❓ Questions for Review

1. **API Key Setup:** Do you have Directions API, Geocoding API, and Places API enabled in Google Cloud Console?

2. **Places API Version:** Do you want to use the new Places API (Places API (New)) or the classic Places API?

3. **Polyline Library:** Keep `@mapbox/polyline` for decoding, or switch to `@googlemaps/polyline-codec`?

4. **Error Handling:** How should we handle API quota exceeded errors? Show user message? Fallback behavior?

5. **Testing:** Do you have test coordinates/addresses in Nigeria to verify accuracy?

6. **Migration Timeline:** Do you want this done incrementally (test each component) or all at once?

---

**Ready to proceed once you confirm the above questions and API key setup!**
