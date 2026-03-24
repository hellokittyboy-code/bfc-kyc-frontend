import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import type { ReactNode } from 'react'
import { Spin } from 'antd'

import AppShell from './app/AppShell'
import { useAuth } from './app/useAuth'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterUserPage = lazy(() => import('./pages/RegisterUserPage'))
const RegisterProjectPage = lazy(() => import('./pages/RegisterProjectPage'))
const KycSubmitPage = lazy(() => import('./pages/KycSubmitPage'))
const ProjectRuleCreatePage = lazy(() => import('./pages/ProjectRuleCreatePage'))
const ProjectRuleQueryPage = lazy(() => import('./pages/ProjectRuleQueryPage'))
const ProjectRuleQueryByNamePage = lazy(() => import('./pages/ProjectRuleQueryByNamePage'))
const ProjectRulesListPage = lazy(() => import('./pages/ProjectRulesListPage'))
const ProjectSearchPage = lazy(() => import('./pages/ProjectSearchPage'))
const UserKycQueryPage = lazy(() => import('./pages/UserKycQueryPage'))
const MatchProjectsPage = lazy(() => import('./pages/MatchProjectsPage'))
const UserProjectTagsPage = lazy(() => import('./pages/UserProjectTagsPage'))

function RequireAuth(props: { children: ReactNode }) {
  const { auth } = useAuth()
  const location = useLocation()
  if (!auth.token) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return props.children
}

function RequireRole(props: { roles: string[]; children: ReactNode }) {
  const { auth } = useAuth()
  if (!auth.token) return <Navigate to="/login" replace />
  if (!props.roles.includes(auth.role)) return <Navigate to="/" replace />
  return props.children
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '60svh' }}>
          <Spin size="large" />
        </div>
      }
    >
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/user" element={<RegisterUserPage />} />
          <Route path="/register/project" element={<RegisterProjectPage />} />

          <Route
            path="/kyc/submit"
            element={
              <RequireAuth>
                <RequireRole roles={['user']}>
                  <KycSubmitPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/projects/rules/create"
            element={
              <RequireAuth>
                <RequireRole roles={['project']}>
                  <ProjectRuleCreatePage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/projects/rules/query"
            element={
              <RequireAuth>
                <ProjectRuleQueryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/projects/rules/query-by-name"
            element={
              <RequireAuth>
                <ProjectRuleQueryByNamePage />
              </RequireAuth>
            }
          />
          <Route
            path="/projects/rules/list"
            element={
              <RequireAuth>
                <ProjectRulesListPage />
              </RequireAuth>
            }
          />
          <Route
            path="/projects/search"
            element={
              <RequireAuth>
                <ProjectSearchPage />
              </RequireAuth>
            }
          />
          <Route
            path="/users/kyc/query"
            element={
              <RequireAuth>
                <UserKycQueryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/match/projects"
            element={
              <RequireAuth>
                <MatchProjectsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/match/tags"
            element={
              <RequireAuth>
                <UserProjectTagsPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
