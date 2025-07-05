'use client';

import { Modal } from '@/components/shared/Modal';
import ProjectForm from '@/app/components/client/projects/ProjectForm';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: { name: string; slug: string; description: string }) => Promise<void>;
  initialData: {
    name: string;
    slug: string;
    description?: string;
  };
}

export function EditProjectModal({ open, onClose, onSubmit, initialData }: EditProjectModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Project">
      <ProjectForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
