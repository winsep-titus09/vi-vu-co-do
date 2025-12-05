// src/components/Common/LazySection.jsx

import React, { useRef, useState, useEffect, Suspense } from "react";

/**
 * LazySection - Component để lazy load các section khi xuất hiện trong viewport
 * Sử dụng Intersection Observer API để tối ưu hiệu năng
 */
const LazySection = ({ 
  children, 
  fallback = null, 
  rootMargin = "200px", // Load trước 200px khi scroll gần đến
  threshold = 0.1,
  minHeight = "400px", // Chiều cao tối thiểu để tránh layout shift
  className = ""
}) => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Ngắt kết nối sau khi đã visible (load 1 lần)
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  // Default fallback với skeleton loading
  const defaultFallback = (
    <div 
      className={`w-full animate-pulse bg-linear-to-r from-bg-main via-white/50 to-bg-main ${className}`}
      style={{ minHeight }}
    >
      <div className="container-main py-16">
        <div className="h-8 w-48 bg-border-light rounded mb-4" />
        <div className="h-4 w-96 bg-border-light/50 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 space-y-4">
              <div className="aspect-4/3 bg-border-light rounded-xl" />
              <div className="h-4 w-3/4 bg-border-light rounded" />
              <div className="h-3 w-1/2 bg-border-light/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={sectionRef} style={{ minHeight: isVisible ? "auto" : minHeight }}>
      {isVisible ? (
        <Suspense fallback={fallback || defaultFallback}>
          {children}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

export default LazySection;
