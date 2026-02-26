import { getRideEstimate } from "@/services/apiservice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

interface RideData {
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    dropoff_address: string;
    pickup_address: string;

}

interface RideDetails {
    pickup: {
        pickupLat: number;
        pickupLong: number;
    };
    destination: {
        dropoffLat: number;
        dropoffLong: number;
    };
    estimated_distance: string;
    estimated_duration: string;
    car_type: string;
    estimated_fare: number;
}

interface RideOption {
    name: string;
    details: string;
    price: string;
    rawPrice: number;
    originalPrice: string | null;
    carType: string;
    passengers: number;
    rideId: string;
    image: any;
    screen: string;
}

interface UseRideEstimatesProps {
    rideData: RideData | null;
}

export default function useRideEstimates({ rideData }: UseRideEstimatesProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
    const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
    const [rideId, setRideId] = useState<string | null>(null);

    const fetchRideEstimates = useCallback(async () => {
        const images = [
            require("../../../../assets/images/car.png"),
            require("../../../../assets/images/car1.png"),
            require("../../../../assets/images/car2.png"),
        ];

        // Early return if no ride data
        if (!rideData?.pickup_lat || !rideData?.pickup_lng || !rideData?.dropoff_lat || !rideData?.dropoff_lng) {
            console.log("⚠️ Missing ride data, skipping fetch");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log("Ride payload:", JSON.stringify(rideData, null, 2));

            const response = await getRideEstimate(rideData);
            console.log("Ride estimates API response:", JSON.stringify(response, null, 2));

            // Updated to match your API response structure
            if (response.status_code === 200 && response.data?.rides) {
                const apiData = response.data;
                console.log('api data----------------', apiData)

                // FIX: Use the actual rideData values instead of undefined variables
                setRideDetails({
                    pickup: {
                        pickupLat: rideData.pickup_lat,
                        pickupLong: rideData.pickup_lng
                    },
                    destination: {
                        dropoffLat: rideData.dropoff_lat,
                        dropoffLong: rideData.dropoff_lng
                    },
                    estimated_distance: apiData.estimated_distance.toString(),
                    estimated_duration: apiData.estimated_duration.toString(),
                    car_type: apiData.rides[0]?.car_type || "",
                    estimated_fare: apiData.rides[0]?.estimated_fare || 0,
                });

                const formattedRides = apiData.rides.map((ride: any, index: number) => ({
                    name: `Kablux ${ride.name.charAt(0).toUpperCase() + ride.name.slice(1)}`,
                    details: `${Math.round(apiData.estimated_duration)} min - ${apiData.estimated_distance.toFixed(2)} km`,
                    price: `₦${ride.estimated_fare.toLocaleString()}`,
                    rawPrice: ride.estimated_fare,
                    originalPrice: null, // No discount in current API response
                    carType: ride.car_type,
                    passengers: ride.car_size,
                    rideId: ride.name,
                    image: images[index % images.length], // Use modulo to cycle through images safely
                    screen: "standardScreen",
                }));

                console.log("✅ Formatted ride options:", formattedRides);
                setRideOptions(formattedRides);

                const ride_request_id = apiData.ride_request_id;
                setRideId(ride_request_id);
                await AsyncStorage.setItem("ride_request_id", ride_request_id);

                console.log("✅ Ride request ID saved:", ride_request_id);
            } else {
                const errorMsg = "Failed to fetch ride estimates";
                console.error("❌", errorMsg);
                setError(errorMsg);
            }
        } catch (err: any) {
            console.error("❌ Error fetching rides:", err);

            if (err.message?.includes("token found") || err.response?.status === 401) {
                setError("Session expired or missing. Please log in.");
            } else {
                setError(err.message || "Error fetching rides");
            }
        } finally {
            setLoading(false);
        }
    }, [rideData]);

    useEffect(() => {
        fetchRideEstimates();
    }, [fetchRideEstimates]);

    return { loading, error, rideDetails, rideOptions, rideId };
}