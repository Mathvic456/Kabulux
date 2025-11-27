import React from 'react'
import { AboutUsScreen } from './ExtraScreens'

export default function AboutUs({ goBack }: { goBack: () => void }) {
  return (
    <AboutUsScreen goBack={goBack} />
  )
}