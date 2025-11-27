import React from 'react'
import { LanguageScreen } from './ExtraScreens'

const Language = ({ goBack }: { goBack: () => void }) => {
  return (
    <LanguageScreen goBack={goBack} />
  )
}

export default LanguageScreen