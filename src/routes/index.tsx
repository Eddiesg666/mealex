import { createFileRoute } from '@tanstack/react-router'
import App from '../App.tsx'
import { StrictMode } from 'react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <StrictMode>
        <App />
    </StrictMode>
  )
}
