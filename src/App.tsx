import { CodeBookPage } from './pages/CodeBookPage'
import { CodePage } from './pages/CodePage'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { AppShell } from './components/layout/AppShell'
import { DeepHub, DeepModulePage } from './pages/DeepPage'
import { LabPage } from './pages/LabPage'
import { LandingPage } from './pages/LandingPage'
import { MePage } from './pages/MePage'
import { NotFound } from './pages/NotFound'
import { OrgPage } from './pages/OrgPage'
import { PeerPage } from './pages/PeerPage'
import { RatePage } from './pages/RatePage'
import { PersonasPage } from './pages/PersonasPage'
import { RoleEditorPage } from './pages/sourcing/RoleEditorPage'
import { RolePage } from './pages/sourcing/RolePage'
import { SourcingHome } from './pages/sourcing/SourcingHome'
import { TeamPage } from './pages/TeamPage'
import { TestPage } from './pages/TestPage'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/test', element: <TestPage /> },
      { path: '/me', element: <MePage /> },
      { path: '/code', element: <CodePage /> },
      { path: '/codes', element: <CodeBookPage /> },
      { path: '/codes/:code', element: <CodeBookPage /> },
      { path: '/peers', element: <PeerPage /> },
      { path: '/deep', element: <DeepHub /> },
      { path: '/deep/:module', element: <DeepModulePage /> },
      { path: '/rate/:token', element: <RatePage /> },
      { path: '/org', element: <OrgPage /> },
      { path: '/personas', element: <PersonasPage /> },
      { path: '/personas/:id', element: <PersonasPage /> },
      { path: '/team', element: <TeamPage /> },
      { path: '/lab', element: <LabPage /> },
      { path: '/sourcing', element: <SourcingHome /> },
      { path: '/sourcing/new', element: <RoleEditorPage /> },
      { path: '/sourcing/:id', element: <RolePage /> },
      { path: '/sourcing/:id/edit', element: <RoleEditorPage /> },
      { path: '/hr', element: <Navigate to="/sourcing" replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  // Matches Vite's `base`, so routes work at /<repo>/ on GitHub Pages and at / locally.
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
})

export function App() {
  return <RouterProvider router={router} />
}
