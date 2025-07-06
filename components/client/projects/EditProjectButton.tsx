'use client';

import { useState } from 'react';
import { ProjectType } from '@/app/types/index';
import { Button } from '@/components/shared/Button';

interface EditProjectButtonProps {
  project: ProjectType;
}

export function EditProjectButton({ project }: EditProjectButtonProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
    // TODO: Implement edit modal or form
    console.log('Edit project:', project);
  };

  return (
    <Button
      onClick={handleClick}
      variant="secondary"
      disabled={isEditing}
    >
      {isEditing ? 'Editing...' : 'Edit'}
    </Button>
  );
}
