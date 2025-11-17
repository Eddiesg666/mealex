import { createFileRoute } from '@tanstack/react-router'
import InvitationPage from '../components/InvitationPage.tsx';
import TopBar from '../components/TopBar.tsx';
import { StrictMode } from 'react';

export const Route = createFileRoute('/invitations')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <StrictMode>
      <TopBar/>
      <InvitationPage />
    </StrictMode>
  );
}
