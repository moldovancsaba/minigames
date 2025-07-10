export interface Organization {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationResponse {
  success: true;
  data: Organization;
}

export interface DeleteOrganizationResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string | {
    message: string;
    errors?: string[];
  };
}
