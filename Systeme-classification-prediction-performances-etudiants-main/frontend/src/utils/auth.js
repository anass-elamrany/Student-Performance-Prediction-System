// src/utils/auth.js
export const isAuthenticated = () => {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    return !!user;
  };
  
  export const getCurrentUser = () => {
    return JSON.parse(sessionStorage.getItem('currentUser'));
  };
  
  export const getUserRole = () => {
    const user = getCurrentUser();
    return user ? user.role : null;
  };
  
  export const logout = async () => {
    try {
      // Call the backend to invalidate the session
      await fetch('/api/logout/', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear client-side storage
      sessionStorage.removeItem('currentUser');
      
      // We keep the localStorage items for "remember me" functionality
      // If you want to clear everything on logout, uncomment the following:
      // localStorage.removeItem('username');
      // localStorage.removeItem('userRole');
      
      // Return success
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };
  
  export const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/user-info/', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update session storage with latest user info
        sessionStorage.setItem('currentUser', JSON.stringify(data.user));
        return data.user;
      } else {
        // Clear session data if not authenticated
        sessionStorage.removeItem('currentUser');
        return null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  };