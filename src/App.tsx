/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';

const PublicPortfolio = lazy(() => import('./components/PublicPortfolio'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));
const ResumeViewer = lazy(() => import('./components/ResumeViewer'));
const NotFound = lazy(() => import('./components/NotFound'));

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'home' | 'admin' | 'resume' | 'notfound'>('home');

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/admin')) {
        setCurrentRoute('admin');
      } else if (path.startsWith('/resume')) {
        setCurrentRoute('resume');
      } else if (path === '/' || path === '') {
        setCurrentRoute('home');
      } else {
        // Check hash links like /#work, /#contact
        if (path === '/') {
          setCurrentRoute('home');
        } else {
          setCurrentRoute('notfound');
        }
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>}>
      {currentRoute === 'admin' && <AdminPortal />}
      {currentRoute === 'resume' && <ResumeViewer />}
      {currentRoute === 'home' && <PublicPortfolio />}
      {currentRoute === 'notfound' && <NotFound />}
    </Suspense>
  );
}
