'use client';

import { Modal } from '@/components/shared/Modal';
import ProjectForm from './ProjectForm';
import { Project } from '@/models/project';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: {
    name: string;
    slug: string;
    description: string;
    status: 'active' | 'archived';
    visibility: 'public' | 'private';
  }) => Promise<void>;
  project: Project;
}

export function EditProjectModal({
  open,
  onClose,
  onSubmit,
  project
}: EditProjectModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Project">
      <ProjectForm
        initialData={{
          name: project.name,
          slug: project.slug,
          description: project.description || ''
        }}
        onSubmit={async (data) => {
          await onSubmit({
            ...data,
            status: project.status,
            visibility: project.visibility
          });
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
