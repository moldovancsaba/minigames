import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { PageParamsProps } from '@/types/page';
import { ProjectModel } from '@/lib/mongodb/projectModel';
import { OrganizationModel } from '@/lib/mongodb/organizationModel';
import { ProjectPageClient } from './page.client';

export async function generateMetadata(props: any): Promise<Metadata> {
  const { params } = props as { params: { id: string } };
  const project = await ProjectModel.findById(params.id);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.name} - Project Details`,
    description: project.description || `Details for project ${project.name}`,
  };
}

// Props for content component
interface ContentProps {
  id: string;
}

async function ProjectPageContent({ id }: ContentProps) {
  const project = await ProjectModel.findById(id);

  if (!project) {
    notFound();
  }

  const organization = await OrganizationModel.findById(project.organizationId);

  if (!organization) {
    throw new Error('Organization not found');
  }

  return <ProjectPageClient project={project} organization={organization} />;
}

export default async function Page(props: any) {
  const { params } = props as { params: { id: string } };
  return <ProjectPageContent id={params.id} />;
}
