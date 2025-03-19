export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('accessToken');
  return !!accessToken;
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
    // Supprimer les tokens côté client
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.access) {
      // Mettre à jour le token d'accès
      localStorage.setItem('accessToken', data.access);
      return data.access;
    } else {
      // Déconnecter l'utilisateur si le rafraîchissement échoue
      logout();
      return null;
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};

export const checkAuthStatus = async () => {
  try {
    let token = localStorage.getItem('accessToken');
    let response = await fetch('http://localhost:8000/api/user-info/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Si la requête échoue avec une erreur 401, essayer de rafraîchir le token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Réessayer la requête avec le nouveau token
        response = await fetch('http://localhost:8000/api/user-info/', {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        // Déconnecter l'utilisateur si le rafraîchissement échoue
        logout();
        return null;
      }
    }
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      sessionStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    } else {
      sessionStorage.removeItem('currentUser');
      return null;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};