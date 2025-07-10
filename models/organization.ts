import mongoose from 'mongoose';
import type { Organization } from '@/app/types/organization';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const OrganizationModel = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);
export { OrganizationModel };
