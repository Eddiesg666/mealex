import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '../components/LandingPage.tsx'
import { StrictMode } from 'react'

function LandingComponent() {
  return (
    <StrictMode>
        <LandingPage />
    </StrictMode>
  )
}

export const Route = createFileRoute('/landing')({
  component: LandingComponent,
})
