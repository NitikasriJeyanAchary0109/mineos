import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SafetyProvider } from './context/SafetyContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { SystemHeader } from './components/shared/SystemHeader';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Worker Pages (In-Mine Mobile Experience)
import { WorkerHomePage } from './pages/worker/WorkerHomePage';
import { LiveSafetyPage } from './pages/worker/LiveSafetyPage';
import { WorkerAlertsPage } from './pages/worker/WorkerAlertsPage';
import { SosEmergencyPage } from './pages/worker/SosEmergencyPage';
import { WorkerProfilePage } from './pages/worker/WorkerProfilePage';

// Control Room Pages (Phase 2)
import { MineOverviewPage } from './pages/controlroom/MineOverviewPage';
import { ControlRoomDashboardPage } from './pages/controlroom/ControlRoomDashboardPage';
import { SelectedWorkerPage } from './pages/controlroom/SelectedWorkerPage';
import { CriticalAlertPage } from './pages/controlroom/CriticalAlertPage';
import { ManageWorkersPage } from './pages/controlroom/ManageWorkersPage';
import { SafetyReportsPage } from './pages/controlroom/SafetyReportsPage';

export function App() {
  return (
    <AuthProvider>
      <SafetyProvider>
        <Router>
          <div className="min-h-screen bg-[#F5F4EF] text-[#151713] flex flex-col font-sans">
            {/* Universal System Telemetry Header & Navigation Switcher */}
            <SystemHeader />

            {/* Page Routing with Role-Based Access Control */}
            <div className="flex-1">
              <Routes>
                {/* Default Landing: Direct to Control Room Console */}
                <Route path="/" element={<Navigate to="/controlroom/dashboard" replace />} />

                {/* Authentication Page */}
                <Route path="/login" element={<LoginPage />} />

                {/* Worker Mobile In-Mine Interface */}
                <Route path="/worker-home" element={<WorkerHomePage />} />
                <Route path="/live-safety" element={<LiveSafetyPage />} />
                <Route path="/alerts" element={<WorkerAlertsPage />} />
                <Route path="/emergency-sos" element={<SosEmergencyPage />} />
                <Route path="/profile" element={<WorkerProfilePage />} />

                {/* Legacy gate routes redirected to controlroom */}
                <Route path="/worker-id" element={<Navigate to="/controlroom/dashboard" replace />} />
                <Route path="/face-ppe-scan" element={<Navigate to="/controlroom/dashboard" replace />} />
                <Route path="/ppe-verification" element={<Navigate to="/controlroom/dashboard" replace />} />
                <Route path="/entry-approved" element={<Navigate to="/controlroom/dashboard" replace />} />

                {/* Phase 2: Control Room (Desktop-First // Protected by Role) */}
                <Route
                  path="/controlroom/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer', 'shift_incharge']}>
                      <ControlRoomDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/controlroom/mine-3d"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer', 'shift_incharge']}>
                      <MineOverviewPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/controlroom/worker"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer', 'shift_incharge']}>
                      <SelectedWorkerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/controlroom/critical-alert"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer', 'shift_incharge']}>
                      <CriticalAlertPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/controlroom/reports"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer', 'shift_incharge']}>
                      <SafetyReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Business Logic: Manage Workers is strictly restricted to Mine Manager and Safety Officer */}
                <Route
                  path="/controlroom/manage-workers"
                  element={
                    <ProtectedRoute allowedRoles={['mine_manager', 'safety_officer']}>
                      <ManageWorkersPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </SafetyProvider>
    </AuthProvider>
  );
}

export default App;
