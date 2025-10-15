import React from 'react';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for admin pages to provide consistent spacing and layout.
 */
export default function AdminPageWrapper({ children, className = '' }: AdminPageWrapperProps) {
  return <div className={`mx-auto mt-16 max-w-7xl space-y-6 pt-6 ${className}`}>{children}</div>;
}
