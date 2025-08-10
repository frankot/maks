import React from "react";

interface AdminPageWrapperProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Wrapper for admin pages to provide consistent spacing and layout.
 */
export default function AdminPageWrapper({
    children,
    className = "",
}: AdminPageWrapperProps) {
    return (
        <div className={`space-y-6 mt-16 pt-6 max-w-7xl mx-auto ${className}`}>
            {children}
        </div>
    );
}
