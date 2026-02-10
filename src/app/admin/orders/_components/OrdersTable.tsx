'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Truck, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminTable, TableColumn } from '../../components/Table';
import { AdminDropdown, DropdownAction } from '../../components/Dropdown';
import { OrderDetailsModal } from './OrderDetailsModal';
import { formatPrice, getStatusVariant, getStatusLabel } from '@/lib/utils/orders';
import { markAsShippedAction, deleteOrderAction } from '../actions';
import type { Order } from '@prisma/client';

interface OrderWithUser extends Order {
  user: {
    email: string;
    phoneNumber: string | null;
  };
}

interface OrdersTableProps {
  orders: OrderWithUser[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
  };

  const handleMarkAsShipped = async (orderId: string) => {
    const result = await markAsShippedAction({ orderId });
    if (result?.serverError) {
      console.error('Failed to mark as shipped:', result.serverError);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      const result = await deleteOrderAction({ orderId });
      if (result?.serverError) {
        console.error('Failed to delete order:', result.serverError);
      }
    }
  };

  const getOrderActions = (order: OrderWithUser): DropdownAction[] => [
    {
      label: 'Details',
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => handleViewDetails(order.id),
    },
    {
      label: 'Mark as shipped',
      icon: <Truck className="mr-2 h-4 w-4" />,
      onClick: () => handleMarkAsShipped(order.id),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => handleDelete(order.id),
      variant: 'destructive' as const,
      separator: true,
    },
  ];

  const columns: TableColumn<OrderWithUser>[] = [
    {
      key: 'id',
      label: 'Order ID',
      render: (order) => <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortValue: (order) => order.status,
      render: (order) => (
        <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortValue: (order) => order.pricePaid,
      render: (order) => formatPrice(order.pricePaid),
    },
    {
      key: 'created',
      label: 'Created',
      sortValue: (order) => new Date(order.createdAt),
      render: (order) => format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
    },
    {
      key: 'email',
      label: 'Customer Email',
      sortValue: (order) => order.user.email,
      render: (order) => order.user.email,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (order) => order.user.phoneNumber || '-',
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (order) => <AdminDropdown actions={getOrderActions(order)} />,
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={orders}
        emptyMessage="No orders found"
        keyExtractor={(order) => order.id}
      />

      {selectedOrderId && (
        <OrderDetailsModal orderId={selectedOrderId} onClose={handleCloseModal} />
      )}
    </>
  );
}
