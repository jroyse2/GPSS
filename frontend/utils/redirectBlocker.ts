// utils/redirectBlocker.ts
let isRedirecting = false;
let redirectTimeout: NodeJS.Timeout | null = null;

export const safeRedirect = (
  router: any, 
  path: string, 
  options: { delay?: number; resetDelay?: number } = {}
) => {
  const { delay = 500, resetDelay = 1000 } = options;
  
  if (isRedirecting) {
    console.log(`Redirect to ${path} blocked - already redirecting`);
    return false;
  }
  
  console.log(`Redirecting to ${path} with delay ${delay}ms`);
  isRedirecting = true;
  
  // Clear any existing timeout
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
  }
  
  // Set timeout for redirect
  redirectTimeout = setTimeout(() => {
    router.push(path);
    
    // Reset redirect flag after navigation completes
    setTimeout(() => {
      isRedirecting = false;
      redirectTimeout = null;
    }, resetDelay);
  }, delay);
  
  return true;
};

export const isCurrentlyRedirecting = () => isRedirecting;