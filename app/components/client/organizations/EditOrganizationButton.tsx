'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/shared/Button';
import { EditOrganizationModal } from './EditOrganizationModal';
import type { Organization } from '@/app/types/organization';
import { OrganizationService } from '@/services/organization';

interface EditOrganizationButtonProps {
  organization: Organization;
}

export function EditOrganizationButton({ organization }: EditOrganizationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleEdit = async (data: { name: string; description: string }) => {
    try {
      setIsEditing(true);
      await OrganizationService.updateOrganization(organization._id, data);
      toast.success('Organization updated successfully');
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update organization. Please try again.'
      );
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="secondary"
        disabled={isEditing}
      >
        {isEditing ? 'Editing...' : 'Edit'}
      </Button>

      <EditOrganizationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleEdit}
        organization={organization}
      />
    </>
  );
}
