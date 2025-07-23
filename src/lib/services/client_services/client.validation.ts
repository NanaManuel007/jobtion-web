import { z } from 'zod';

// Client form validation schema
export const clientFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  ceoFirstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  ceoLastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  jobTitle: z.string().optional(), // This maps to companyJobTitle
  companyEmail: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).optional(), // Only for new clients
  companyNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  companyAddress: z.string().min(5, { message: "Address must be at least 5 characters" }),
  postalCode: z.string().min(3, { message: "Postal code is required" }),
  registrationNumber: z.string().min(1, { message: "Registration number is required" }),
  pronouns: z.string().optional(),
  title: z.string().optional(),
  otherName: z.string().optional(),
  aboutCompany: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  mapsLocation: z.string().optional(),
  companyLogo: z.union([
    z.instanceof(File)
      .refine((file) => file.size <= 10 * 1024 * 1024, {
        message: "Logo file size must be less than 10MB"
      })
      .refine((file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/jpg'];
        return validTypes.includes(file.type);
      }, { message: "Logo must be a valid image file (JPEG, PNG, GIF, JPG or SVG)" }),
    z.string().optional(),
    z.null()
  ]).optional(),
});

// Type for the form data
export type ClientFormData = z.infer<typeof clientFormSchema>;

// Function to validate form data
export function validateClientForm(data: any) {
  const result = clientFormSchema.safeParse(data);
  if (!result.success) {
    const formattedErrors: Record<string, string> = {};
    result.error.errors.forEach(error => {
      const path = error.path[0] as string;
      formattedErrors[path] = error.message;
    });
    return { success: false, errors: formattedErrors };
  }
  return { success: true, data: result.data, errors: {} };
}