'use client';

import { EditCollections } from '../../components/EditCollections';
import { useRouter } from 'next/navigation';

export function EditCollectionsClient() {
  const router = useRouter();

  const handleCollectionsChanged = () => {
    router.refresh();
  };

  return <EditCollections onCollectionsChanged={handleCollectionsChanged} />;
}
