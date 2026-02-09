import { useEffect, useRef, useState } from "react";
import { useRideBooking } from "@/context/RideBookingContext";

export default function useMapModal() {
    const [modal, setModal] = useState(null);
    const cameraRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Access ride booking context
    const { pickupLocation, dropoffLocation, setPickupLocation, setDropoffLocation } = useRideBooking();

    const handleSelectDestination = (location) => {
        console.log('Destination selected:', location);
        setDropoffLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            name: location.name,
        });
        setShowSearchModal(false);
    };

    return {
        modal,
        setModal,
        cameraRef,
        selectedLocation,
        setSelectedLocation,
        showSearchModal,
        setShowSearchModal,
        handleSelectDestination,
        // Expose ride booking context
        pickupLocation,
        dropoffLocation,
        setPickupLocation,
        setDropoffLocation,
    };
}