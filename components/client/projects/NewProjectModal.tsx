'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/shared/Button';
import { TextArea, Select } from '@/components/shared/Form';
import { Modal } from '@/components/shared/Modal';
import { useOrganizations } from '@/app/hooks/useOrganizations';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (project: {
    name: string;
    description: string;
    slug: string;
    organizationId: string;
    visibility: 'public' | 'private';
    status: 'active' | 'archived';
  }) => Promise<void>;
}

export function NewProjectModal({ open, onClose, onSubmit }: NewProjectModalProps) {
  const { organizations, loading: orgsLoading } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState('');

  useEffect(() => {
    if (organizations?.length === 1) {
      setSelectedOrgId(organizations[0]._id);
    }
  }, [organizations]);
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

    // Form validation
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!selectedOrgId) {
      setError('Please select an organization');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        description,
        slug: generateSlug(name),
        organizationId: selectedOrgId,
        visibility: 'private',
        status: 'active'
      });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit}>
        <Select
          id="organization"
          label="Organization"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          disabled={orgsLoading}
        >
          <option value="">Select an organization</option>
          {organizations?.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </Select>

        <TextArea
          id="name"
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          error={!name.trim() ? 'Project name is required' : ''}
        />
        <TextArea
          id="description"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
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
