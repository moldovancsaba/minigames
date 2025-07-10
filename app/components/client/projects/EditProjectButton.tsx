'use client';

import { useState } from 'react';
import { ProjectType } from '@/app/types/index';
import { Button } from '@/components/shared/Button';
import { EditProjectModal } from './EditProjectModal';
import { updateProject } from '@/services/client/projectService';

interface EditProjectButtonProps {
  project: ProjectType;
}

export function EditProjectButton({ project }: EditProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (updatedProject: {
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'archived';
    visibility: 'public' | 'private';
  }) => {
    try {
      setIsLoading(true);
      await updateProject(project._id, updatedProject);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="secondary"
        disabled={isLoading}
      >
        {isLoading ? 'Updating...' : 'Edit'}
      </Button>
      <EditProjectModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        project={project}
      />
    </>
  );
}
