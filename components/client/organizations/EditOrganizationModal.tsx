'use client';

import { Modal } from '@/components/shared/Modal';
import OrganizationForm from '@/app/components/client/organizations/OrganizationForm';

interface EditOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (organization: { name: string; slug: string; description: string }) => Promise<void>;
  initialData: {
    name: string;
    slug: string;
    description?: string;
  };
}

export function EditOrganizationModal({ open, onClose, onSubmit, initialData }: EditOrganizationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Organization">
      <OrganizationForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
