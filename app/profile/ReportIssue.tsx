import React from 'react'
import { ReportIssueScreen } from './ExtraScreens'

export default function ReportIssue({ goBack }: { goBack: () => void }) {
  return (
    <ReportIssueScreen goBack={goBack} />
  )
}