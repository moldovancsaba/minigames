import { notFound } from 'next/navigation';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { ProjectModel } from '@/lib/mongodb/projectModel';
import { OrganizationPageClient } from './page.client';
import type { Metadata } from 'next';

export async function generateMetadata(props: any): Promise<Metadata> {
  const { params } = props as { params: { id: string } };
  const organization = await OrganizationModel.findById(params.id);
  
  if (!organization) {
    return {
      title: 'Organization Not Found',
    };
  }

  return {
    title: `${organization.name} - Organization Details`,
    description: organization.description || `Details for organization ${organization.name}`,
  };
}

// Props for content component
interface ContentProps {
  id: string;
}

async function OrganizationPageContent({ id }: ContentProps) {
  const organization = await OrganizationModel.findById(id);

  if (!organization) {
    notFound();
  }

  const projects = await ProjectModel.findByOrganization(id);

  return <OrganizationPageClient organization={organization} projects={projects} />;
}

export default async function Page(props: any) {
  const { params } = props as { params: { id: string } };
  return <OrganizationPageContent id={params.id} />;
}
