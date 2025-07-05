'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectService } from '@/services/client/projectService';
import { AssociationClient } from '@/services/client/associationClient';
import { toast } from 'react-toastify';
import { Button } from '@/components/shared/Button';

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  organizationId?: string;
}

export function DeleteProjectButton({ projectId, projectName, organizationId }: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      // If organizationId is provided, verify project belongs to organization
      if (organizationId) {
        const belongsToOrg = await AssociationClient.verifyProjectOrganization(
          projectId,
          organizationId
        );
        if (!belongsToOrg) {
          throw new Error('Project does not belong to this organization');
        }
      }

      const success = await ProjectService.deleteProject(projectId);
      if (success) {
        toast.success('Project deleted successfully');
        // If we're in an organization context, redirect to org's projects
        if (organizationId) {
          router.push(`/organizations/${organizationId}`);
        } else {
          router.push('/projects');
        }
        router.refresh();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete project. Please try again.'
      );
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
      {isDeleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
