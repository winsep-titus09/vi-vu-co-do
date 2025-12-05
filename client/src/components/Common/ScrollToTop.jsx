import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Component tự động scroll về đầu trang khi chuyển route
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}