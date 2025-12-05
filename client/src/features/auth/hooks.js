import { useState, useEffect, useCallback } from "react";

/**
 * useAuth - Custom hook để quản lý trạng thái xác thực
 * Kiểm tra token và user data từ localStorage
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (cross-tab sync)
    const handleStorage = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkAuth();
      }
    };

    // Listen for custom auth event (same-tab sync)
    const handleAuthChange = () => checkAuth();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  const isAuthenticated = !!user;

  return { user, isLoading, isAuthenticated, refresh: checkAuth };
}

export default useAuth;
