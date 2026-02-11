import * as Location from "expo-location";

export async function getCurrentLocation() {
    // Ask for permission
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
        throw new Error("Location permission not granted");
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });
    // console.log('from the source', location)

    return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
}