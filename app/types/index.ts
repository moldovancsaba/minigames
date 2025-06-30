export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  organizationId: string;
}
