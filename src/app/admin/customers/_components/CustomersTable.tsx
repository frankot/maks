'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Eye, Trash2 } from 'lucide-react';
import { AdminTable, TableColumn } from '../../components/Table';
import { AdminDropdown, DropdownAction } from '../../components/Dropdown';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { formatCustomerName, calculateTotalSpent, formatPrice } from '@/lib/customers';
import { deleteCustomerAction } from '../actions';
import type { User, OrderStatus } from '@/app/generated/prisma';

interface CustomerWithOrders extends User {
  orders: Array<{
    id: string;
    status: OrderStatus;
    pricePaid: number;
    createdAt: Date;
  }>;
  _count: {
    orders: number;
  };
}

interface CustomersTableProps {
  customers: CustomerWithOrders[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
  };

  const handleCloseModal = () => {
    setSelectedCustomerId(null);
  };

  const handleDelete = async (customerId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this customer? This will also delete all their orders.'
      )
    ) {
      const result = await deleteCustomerAction(customerId);
      if (!result.success) {
        console.error('Failed to delete customer:', result.error);
      }
    }
  };

  const getCustomerActions = (customer: CustomerWithOrders): DropdownAction[] => [
    {
      label: 'View Details',
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => handleViewDetails(customer.id),
    },
    {
      label: 'Delete Customer',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => handleDelete(customer.id),
      variant: 'destructive' as const,
      separator: true,
    },
  ];

  const columns: TableColumn<CustomerWithOrders>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (customer) => (
        <span className="font-medium">
          {formatCustomerName(customer.firstName, customer.lastName)}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer) => customer.email,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (customer) => customer.phoneNumber || '-',
    },
    {
      key: 'orders',
      label: 'Orders',
      render: (customer) => customer._count.orders,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      render: (customer) => formatPrice(calculateTotalSpent(customer.orders)),
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (customer) => format(new Date(customer.createdAt), 'dd/MM/yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (customer) => <AdminDropdown actions={getCustomerActions(customer)} />,
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={customers}
        emptyMessage="No customers found"
        keyExtractor={(customer) => customer.id}
      />

      {selectedCustomerId && (
        <CustomerDetailsModal customerId={selectedCustomerId} onClose={handleCloseModal} />
      )}
    </>
  );
}
