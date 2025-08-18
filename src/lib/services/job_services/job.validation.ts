import { z } from 'zod';

export const daySessionSchema = z.object({
    day: z.string().min(1, "Day is required"),
    start_at: z.string().min(1, "Start time is required"),
    start_end: z.string().min(1, "End time is required"),
});

export const jobSchema = z.object({
    job_title: z.string().min(1, "Job title is required"),
    amount: z.number().positive("Amount must be greater than zero"),
    payment_type: z.string().min(1, "Payment type is required"),
    job_type: z.enum(['Permanent', 'Temporary']),
    employment_type: z.string().min(1, "Employment type is required"),
    job_location: z.string(),
    hours: z.number(),
    duty_1: z.string().min(1, "At least one duty is required").nullable(),
    duty_2: z.string().optional().nullable(),
    duty_3: z.string().optional().nullable(),
    duty_4: z.string().optional().nullable(),
    requirment_1: z.string().min(1, "At least one requirement is required").nullable(),
    requirment_2: z.string().optional().nullable(),
    requirment_3: z.string().optional().nullable(),
    requirment_4: z.string().optional().nullable(),
    posted_start_date: z.string(),
    posted_roles: z.number(),
    publish: z.number(),
    // Add qualification validation
    qualificationTypeId: z.string().uuid().optional(),
    requiredQualificationName: z.string().optional(),
    qualificationTypeCode: z.string().optional(),
    requiredLevel: z.string().optional(),
});