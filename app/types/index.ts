export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProjectType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
  visibility: 'public' | 'private';
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  settings: {
    allowComments: boolean;
    moderateComments: boolean;
    enableSharing: boolean;
    allowDownloads: boolean;
    maxImageSize?: number;
    allowedFileTypes?: string[];
  };
  metadata: {
    totalImages: number;
    lastActivity: string;
    tags: string[];
    contributors?: {
      userId: string;
      role: 'owner' | 'editor' | 'viewer';
      joinedAt: string;
      permissions: string[];
    }[];
  };
}
