import React, { createContext, ReactNode, useContext, useState } from 'react';

interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
}

interface RideBookingContextType {
    pickupLocation: LocationData | null;
    dropoffLocation: LocationData | null;
    setPickupLocation: (location: LocationData | null) => void;
    setDropoffLocation: (location: LocationData | null) => void;
    clearRideData: () => void;
}

const RideBookingContext = createContext<RideBookingContextType | undefined>(undefined);

export function RideBookingProvider({ children }: { children: ReactNode }) {
    const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);

    const clearRideData = () => {
        setPickupLocation(null);
        setDropoffLocation(null);
    };

    return (
        <RideBookingContext.Provider
            value={{
                pickupLocation,
                dropoffLocation,
                setPickupLocation,
                setDropoffLocation,
                clearRideData,
            }}
        >
            {children}
        </RideBookingContext.Provider>
    );
}

export function useRideBooking() {
    const context = useContext(RideBookingContext);
    if (!context) {
        throw new Error('useRideBooking must be used within RideBookingProvider');
    }
    return context;
}