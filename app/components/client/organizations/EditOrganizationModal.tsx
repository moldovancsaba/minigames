'use client';

import { Modal } from '@/components/shared/Modal';
import OrganizationForm from './OrganizationForm';
import type { Organization } from '@/app/types/organization';

interface EditOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (organization: {
    name: string;
    description: string;
  }) => Promise<void>;
  organization: Organization;
}

export function EditOrganizationModal({
  open,
  onClose,
  onSubmit,
  organization
}: EditOrganizationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Organization">
      <OrganizationForm
        initialData={{
          name: organization.name,
          description: organization.description || ''
        }}
        onSubmit={async (data) => {
          await onSubmit(data);
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
