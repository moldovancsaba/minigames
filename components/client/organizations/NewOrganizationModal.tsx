'use client';

import { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { TextArea } from '@/components/shared/Form';
import { Modal } from '@/components/shared/Modal';

interface NewOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (organization: { name: string; description: string; slug: string }) => Promise<void>;
}

export function NewOrganizationModal({ open, onClose, onSubmit }: NewOrganizationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Generate a URL-friendly slug from the name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        description,
        slug: generateSlug(name)
      });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Organization">
      <form onSubmit={handleSubmit}>
        <TextArea
          id="name"
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter organization name"
        />
        <TextArea
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter organization description"
        />
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
