import Mapbox from "@rnmapbox/maps";

// Initialize Mapbox with your public token
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN || '');

export default Mapbox;