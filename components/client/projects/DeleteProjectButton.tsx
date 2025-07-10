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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('not belong to this organization')) {
      return 'You do not have permission to delete this project';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
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
      // Pass organizationId to deleteProject for ownership verification
      const success = await ProjectService.deleteProject(projectId, organizationId);
      if (success) {
        toast.success('Project deleted successfully');
        // If we're in an organization context, redirect to org's projects
        if (organizationId) {
          router.push(`/organizations/${organizationId}` as any);
        } else {
          router.push('/projects' as any);
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
