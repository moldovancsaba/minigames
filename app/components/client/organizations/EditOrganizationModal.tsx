'use client';

import { Modal } from '@/components/shared/Modal';
import OrganizationForm from './OrganizationForm';
import { Organization } from '@/services/organizationService';

interface EditOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (organization: {
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'inactive' | 'archived';
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
          slug: organization.slug,
          description: organization.description || ''
        }}
        onSubmit={async (data) => {
          await onSubmit({
            ...data,
            status: organization.status
          });
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
