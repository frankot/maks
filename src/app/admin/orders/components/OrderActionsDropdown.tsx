"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Truck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markAsShippedAction, deleteOrderAction } from "../actions";

interface OrderActionsDropdownProps {
  orderId: string;
  onViewDetails: (orderId: string) => void;
}

export function OrderActionsDropdown({
  orderId,
  onViewDetails,
}: OrderActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsShipped = async () => {
    setIsLoading(true);
    try {
      const result = await markAsShippedAction(orderId);
      if (!result.success) {
        console.error("Failed to mark as shipped:", result.error);
      }
    } catch (error) {
      console.error("Error marking as shipped:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setIsLoading(true);
      try {
        const result = await deleteOrderAction(orderId);
        if (!result.success) {
          console.error("Failed to delete order:", result.error);
        }
      } catch (error) {
        console.error("Error deleting order:", error);
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
        <DropdownMenuItem onClick={() => onViewDetails(orderId)}>
          <Eye className="mr-2 h-4 w-4" />
          Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMarkAsShipped}>
          <Truck className="mr-2 h-4 w-4" />
          Mark as shipped
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
