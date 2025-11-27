import React from 'react'
import { RateAppScreen } from './ExtraScreens'

export default function RateApp({ goBack }: { goBack: () => void }) {
  return (
    <RateAppScreen goBack={goBack} />
  )
}