import { z } from 'zod';


// Single role validation schema
export const RoleSchema = z.object({
  role_name: z.string()
    .min(1, 'Role name is required')
    .max(50, 'Role name cannot exceed 50 characters'),
  role_description: z.string()
    .max(200, 'Role description cannot exceed 200 characters')
    .optional(),
  access: z.array(z.string())
    .min(1, 'At least one access permission is required')
});