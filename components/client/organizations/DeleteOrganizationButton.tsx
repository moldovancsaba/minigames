'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/shared/Button';

interface DeleteOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
}

export function DeleteOrganizationButton({ organizationId, organizationName }: DeleteOrganizationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Replace this with your API call
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }

      toast.success('Organization deleted successfully');
      window.location.href = '/organizations';
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Unable to process your request at this time. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="danger"
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete Organization'}
    </Button>
  );
}
