import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
};

export function DetailsModal({
  isOpen,
  onClose,
  title,
  children,
  loading = false,
  error = null,
  size = '3xl',
}: DetailsModalProps) {
  const sizeClass = sizeClasses[size];

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`${sizeClass} max-h-[95vh] overflow-y-auto`}
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={`${sizeClass} max-h-[95vh] overflow-y-auto`}
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Error</DialogTitle>
          </DialogHeader>
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg font-medium text-red-600">Something went wrong</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={`${sizeClass} max-h-[95vh] overflow-y-auto p-0`}
        showCloseButton={true}
      >
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900">{title}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-10">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
