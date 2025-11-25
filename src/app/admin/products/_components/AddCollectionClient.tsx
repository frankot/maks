'use client';

import { AddCollection } from '../../components/AddCollection';
import { useRouter } from 'next/navigation';

export function AddCollectionClient() {
  const router = useRouter();

  const handleCollectionAdded = () => {
    router.refresh();
  };

  return <AddCollection onCollectionAdded={handleCollectionAdded} />;
}
