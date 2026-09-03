import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage';
import { CaregiverLayout } from '../components/layout/CaregiverLayout';
import { SessionLayout } from '../components/layout/SessionLayout';

// Sub-pages matching page hierarchy rules
import { DashboardPage } from '../pages/Caregiver/DashboardPage';
import { PatientListPage } from '../pages/Caregiver/PatientListPage';
import { PatientCreatePage } from '../pages/Caregiver/PatientCreatePage';
import { PatientProfilePage } from '../pages/Caregiver/PatientProfilePage';
import { PatientSettingsPage } from '../pages/Caregiver/PatientSettingsPage';
import { SessionStartPage } from '../pages/Session/SessionStartPage';
import { PatientSessionPage } from '../pages/Session/PatientSessionPage';
import { SessionSummaryPage } from '../pages/Session/SessionSummaryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/caregiver',
    element: <CaregiverLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'patients', element: <PatientListPage /> },
      { path: 'patients/new', element: <PatientCreatePage /> },
      { path: 'patients/:patientId', element: <PatientProfilePage /> },
      { path: 'patients/:patientId/settings', element: <PatientSettingsPage /> },
    ],
  },
  {
    path: '/session',
    element: <SessionLayout />,
    children: [
      { path: 'start/:patientId', element: <SessionStartPage /> },
      { path: ':sessionId', element: <PatientSessionPage /> },
      { path: ':sessionId/summary', element: <SessionSummaryPage /> },
    ],
  },
]);
