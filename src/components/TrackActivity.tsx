
// 'use client';

// import { useEffect, useRef } from 'react';
// import { useAuth } from '@/hooks/useAuth';

// export function TrackActivity() {
//   const { user, isAuthenticated } = useAuth();
//   const lastTrackedRef = useRef<number>(0);
//   const currentPageRef = useRef<string>('');

//   useEffect(() => {
//     if (!user || !isAuthenticated) return;

//     const track = async (actionType: string) => {
//       const now = Date.now();
//       if (now - lastTrackedRef.current < 10000) return; // 10s entre tracks
      
//       lastTrackedRef.current = now;

//       try {
//         await fetch('/api/user/activity', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             pageUrl: window.location.pathname + window.location.search,
//             actionType: actionType,
//             userId: user.id
//           }),
//         });
//       } catch (error) {
//         console.error('Track error:', error);
//       }
//     };

//     // 1. PAGE LOAD
//     const url = window.location.pathname + window.location.search;
//     currentPageRef.current = url;
//     track('page_load');

//     // 2. PAGE VIEW (changements de route)
//     const handleRouteChange = () => {
//       const newUrl = window.location.pathname + window.location.search;
//       if (newUrl !== currentPageRef.current) {
//         currentPageRef.current = newUrl;
//         track('page_view');
//       }
//     };

//     // 3. CLICK
//     let clickTimeout: NodeJS.Timeout;
//     const handleClick = () => {
//       clearTimeout(clickTimeout);
//       clickTimeout = setTimeout(() => track('click'), 1000);
//     };

//     // Écouteurs
//     const originalPushState = history.pushState;
//     const originalReplaceState = history.replaceState;

//     history.pushState = (...args) => {
//       originalPushState.apply(history, args);
//       setTimeout(handleRouteChange, 100);
//     };

//     history.replaceState = (...args) => {
//       originalReplaceState.apply(history, args);
//       setTimeout(handleRouteChange, 100);
//     };

//     window.addEventListener('popstate', handleRouteChange);
//     window.addEventListener('click', handleClick);

//     return () => {
//       history.pushState = originalPushState;
//       history.replaceState = originalReplaceState;
//       window.removeEventListener('popstate', handleRouteChange);
//       window.removeEventListener('click', handleClick);
//       clearTimeout(clickTimeout);
//     };
//   }, [user, isAuthenticated]);

//   return null;
// }
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function TrackActivity() {
  const { user, isAuthenticated } = useAuth();
  const lastTrackedRef = useRef<number>(0);
  const currentPageRef = useRef<string>('');

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const track = async (actionType: string) => {
      const now = Date.now();
      if (now - lastTrackedRef.current < 10000) return; // 10s entre tracks
      
      lastTrackedRef.current = now;

      try {
        await fetch('/api/user/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageUrl: window.location.pathname + window.location.search,
            actionType: actionType,
            userId: user.id
          }),
        });
      } catch (error) {
        console.error('Track error:', error);
      }
    };

    // 1. PAGE LOAD
    const url = window.location.pathname + window.location.search;
    currentPageRef.current = url;
    track('page_load');

    // 2. PAGE VIEW (changements de route)
    const handleRouteChange = () => {
      const newUrl = window.location.pathname + window.location.search;
      if (newUrl !== currentPageRef.current) {
        currentPageRef.current = newUrl;
        track('page_view');
      }
    };

    // Écouteurs pour les changements de route
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 100);
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      setTimeout(handleRouteChange, 100);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user, isAuthenticated]);

  return null;
}