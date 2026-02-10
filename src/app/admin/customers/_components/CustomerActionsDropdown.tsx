'use client';

import { useState } from 'react';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { deleteCustomerAction } from '../actions';

interface CustomerActionsDropdownProps {
  customerId: string;
  onViewDetails: (customerId: string) => void;
}

export function CustomerActionsDropdown({
  customerId,
  onViewDetails,
}: CustomerActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete this customer? This will also delete all their orders.'
      )
    ) {
      setIsLoading(true);
      try {
        const result = await deleteCustomerAction({ customerId });
        if (result?.serverError) {
          console.error('Failed to delete customer:', result.serverError);
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(customerId)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Customer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
