/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';

const PublicPortfolio = lazy(() => import('./components/PublicPortfolio'));
const AdminPortal = lazy(() => import('./components/AdminPortal'));

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) {
      setIsAdminRoute(true);
    }
  }, []);

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading...</div>}>
      {isAdminRoute ? <AdminPortal /> : <PublicPortfolio />}
    </Suspense>
  );
}
