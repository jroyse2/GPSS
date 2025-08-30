// utils/routerLock.ts
class RouterLock {
  private static instance: RouterLock;
  private locked: boolean = false;
  private lockTimer: NodeJS.Timeout | null = null;
  private redirectHistory: string[] = [];
  private maxHistoryLength: number = 5;
  private lockDuration: number = 5000; // 5 seconds
  
  private constructor() {
    // Private constructor for singleton
    if (typeof window !== 'undefined') {
      // Clear any existing redirect history on page load
      localStorage.removeItem('redirectHistory');
      localStorage.removeItem('isRouterLocked');
    }
  }
  
  public static getInstance(): RouterLock {
    if (!RouterLock.instance) {
      RouterLock.instance = new RouterLock();
    }
    return RouterLock.instance;
  }
  
  public lock(): void {
    this.locked = true;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('isRouterLocked', 'true');
    }
    
    // Clear any existing lock timer
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
    }
    
    // Set a new lock timer
    this.lockTimer = setTimeout(() => {
      this.unlock();
    }, this.lockDuration);
    
    console.log(`[RouterLock] Router locked for ${this.lockDuration}ms`);
  }
  
  public unlock(): void {
    this.locked = false;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isRouterLocked');
    }
    
    if (this.lockTimer) {
      clearTimeout(this.lockTimer);
      this.lockTimer = null;
    }
    
    console.log('[RouterLock] Router unlocked');
  }
  
  // This is the method that was missing/misnamed
  public isLocked(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isRouterLocked') === 'true';
    }
    return this.locked;
  }
  
  public addToHistory(path: string): void {
    if (typeof window !== 'undefined') {
      // Get current history
      const historyStr = localStorage.getItem('redirectHistory');
      let history: string[] = historyStr ? JSON.parse(historyStr) : [];
      
      // Add new path
      history.push(path);
      
      // Keep only the last N entries
      if (history.length > this.maxHistoryLength) {
        history = history.slice(history.length - this.maxHistoryLength);
      }
      
      // Save back to localStorage
      localStorage.setItem('redirectHistory', JSON.stringify(history));
      
      this.redirectHistory = history;
    } else {
      this.redirectHistory.push(path);
      
      // Keep only the last N entries
      if (this.redirectHistory.length > this.maxHistoryLength) {
        this.redirectHistory = this.redirectHistory.slice(
          this.redirectHistory.length - this.maxHistoryLength
        );
      }
    }
  }
  
  public getHistory(): string[] {
    if (typeof window !== 'undefined') {
      const historyStr = localStorage.getItem('redirectHistory');
      return historyStr ? JSON.parse(historyStr) : [];
    }
    return this.redirectHistory;
  }
  
  public clearHistory(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redirectHistory');
    }
    this.redirectHistory = [];
  }
  
  public detectLoop(): boolean {
    const history = this.getHistory();
    
    // Need at least 4 entries to detect a loop
    if (history.length < 4) return false;
    
    // Check for alternating patterns like login -> dashboard -> login -> dashboard
    let isAlternating = true;
    for (let i = 0; i < history.length - 1; i += 2) {
      if (i + 1 < history.length) {
        if (history[i] !== history[i + 2] || history[i + 1] !== history[i + 3]) {
          isAlternating = false;
          break;
        }
      }
    }
    
    if (isAlternating) {
      console.error('[RouterLock] Redirect loop detected in history:', history);
      return true;
    }
    
    return false;
  }
  
  public safeNavigate(router: any, path: string): boolean {
    // Don't navigate if we're already on this path
    if (typeof window !== 'undefined' && router.pathname === path) {
      console.log(`[RouterLock] Already on ${path}, no navigation needed`);
      return false;
    }
    
    // Add to history before checking for loops
    this.addToHistory(path);
    
    // Check for redirect loops
    if (this.detectLoop()) {
      console.error('[RouterLock] Navigation blocked due to detected redirect loop');
      this.lock();
      this.clearHistory();
      
      // Force to home page to break the loop
      if (path === '/dashboard' || path === '/auth/login') {
        console.log('[RouterLock] Breaking loop by navigating to home page');
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      }
      
      return false;
    }
    
    // Don't navigate if router is locked
    if (this.isLocked()) {
      console.warn(`[RouterLock] Navigation to ${path} blocked - router is locked`);
      return false;
    }
    
    // Lock the router
    this.lock();
    
    // Navigate with delay
    console.log(`[RouterLock] Navigating to ${path} with delay`);
    setTimeout(() => {
      router.push(path);
    }, 500);
    
    return true;
  }
}

export default RouterLock.getInstance();