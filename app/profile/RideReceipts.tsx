import React from 'react';
import { RideReceiptsScreen } from "./ExtraScreens";

export default function RideReciepts({ goBack }: { goBack: () => void }) {
  return (
    <RideReceiptsScreen goBack={goBack}/>
  )
}