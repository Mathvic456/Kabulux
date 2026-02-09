import { useEffect } from "react";
import ChooseRide from "./components/ChooseRide";
import PickDestination from "./components/PickDestination";
import PickLocation from "./components/PickLocation";
import useMapModal from "./hooks/useMapModal";
import { switchPages } from "./lib/constants";

interface MapModalProps {
    handleSelectPlace: (place: any) => void;
    setScreen?: (screen: string, data?: any) => void; // Add this prop
}

export default function MapModal({ handleSelectPlace, setScreen }: MapModalProps) {
    const { modal, setModal } = useMapModal();

    useEffect(() => {
        console.log("Current Modal:", modal);
    }, [modal]);

    switch (modal) {
        case switchPages.pickupLocation:
            return <PickLocation handleSelectPlace={handleSelectPlace} setModal={setModal} />;
        case switchPages.setDestination:
            return <PickDestination setModal={setModal} />;
        case switchPages.chooseRide:
            return <ChooseRide setModal={setModal} setScreen={setScreen} />;
        default:
            return <PickLocation handleSelectPlace={handleSelectPlace} setModal={setModal} />;
    }
}