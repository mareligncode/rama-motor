import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api, {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getStoredToken());
  const [currentUser, setCurrentUserState] = useState(() => getStoredUser());
  const [currentStaff, setCurrentStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch staff profile for the logged in user
  const loadStaffProfile = async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setCurrentStaff(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getStaffMe();
      if (res?.data?.staff) {
        setCurrentStaff(res.data.staff);
      } else {
        setCurrentStaff(null);
      }
    } catch {
      // User is authenticated but might not have a staff profile record yet or token expired
      setCurrentStaff(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffProfile();
  }, [token]);

  const login = (newToken, newUser) => {
    setStoredToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
    setCurrentUserState(newUser);
  };

  const logout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setTokenState(null);
    setCurrentUserState(null);
    setCurrentStaff(null);
  };

  // Extract roles and permissions
  const roleName = currentStaff?.roleId?.name || (currentUser?.roles?.includes('admin') ? 'Super Admin' : null);
  const isSuperAdmin =
    roleName === 'Super Admin' ||
    currentUser?.roles?.includes('admin') ||
    currentStaff?.roleId?.permissions?.includes('*');

  const permissions = useMemo(() => {
    if (isSuperAdmin) return ['*'];
    if (Array.isArray(currentStaff?.roleId?.permissions)) {
      return currentStaff.roleId.permissions;
    }
    return [];
  }, [isSuperAdmin, currentStaff]);

  /**
   * Check if the staff member has a specific permission
   */
  const hasPermission = (permission) => {
    if (!token) return false;
    if (isSuperAdmin) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if the staff member has at least one of the specified permissions
   */
  const hasAnyPermission = (permList = []) => {
    if (!token) return false;
    if (isSuperAdmin) return true;
    return permList.some((p) => permissions.includes(p));
  };

  /**
   * Check if the staff member has all of the specified permissions
   */
  const hasAllPermissions = (permList = []) => {
    if (!token) return false;
    if (isSuperAdmin) return true;
    return permList.every((p) => permissions.includes(p));
  };

  /**
   * Check if the staff member has a specific role name
   */
  const hasRole = (targetRole) => {
    if (!roleName) return false;
    return roleName.toLowerCase() === targetRole.toLowerCase();
  };

  /**
   * Tab access definitions based on permissions
   */
  const tabPermissions = {
    staff: ['staff:read'],
    roles: ['roles:read'],
    dispatch: ['deliveries:read', 'deliveries:dispatch', 'drivers:read'],
    audit: ['audit:read'],
  };

  const canAccessTab = (tabId) => {
    if (!token) return false;
    if (isSuperAdmin) return true;
    const required = tabPermissions[tabId];
    if (!required || required.length === 0) return true;
    return required.some((perm) => permissions.includes(perm));
  };

  const department = currentStaff?.department || 'Operations';

  const value = {
    token,
    currentUser,
    currentStaff,
    roleName,
    department,
    permissions,
    isSuperAdmin,
    isAuthenticated: !!token,
    isStaff: !!currentStaff || currentUser?.roles?.includes('staff'),
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccessTab,
    login,
    logout,
    refreshProfile: loadStaffProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
