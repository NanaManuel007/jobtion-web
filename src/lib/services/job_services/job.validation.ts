// import { z } from 'zod';

// export const daySessionSchema = z.object({
//     day: z.string().min(1, "Day is required"),
//     start_at: z.string().min(1, "Start time is required"),
//     start_end: z.string().min(1, "End time is required"),
// });

// export const jobSchema = z.object({
//     job_title: z.string().min(1, "Job title is required"),
//     amount: z.number().positive("Amount must be greater than zero"),
//     payment_type: z.string().min(1, "Payment type is required"),
//     job_type: z.enum(['Permanent', 'Temporary']),
//     employment_type: z.string().min(1, "Employment type is required"),
//     job_location: z.string(),
//     hours: z.number(),
//     duty_1: z.string().min(1, "At least one duty is required"),
//     duty_2: z.string().optional(),
//     duty_3: z.string().optional(),
//     duty_4: z.string().optional(),
//     requirment_1: z.string().min(1, "At least one requirement is required"),
//     requirment_2: z.string().optional(),
//     requirment_3: z.string().optional(),
//     requirment_4: z.string().optional(),
//     posted_start_date: z.string(),
//     posted_roles: z.number(),
//     publish: z.number(),
//     // days_sessions: z.union([
//     //     z.undefined(),
//     //     z.array(daySessionSchema).refine(
//     //         (sessions) => {
//     //             // Only validate days that have been included in the array
//     //             // If no days are selected, that's fine for permanent jobs
//     //             if (sessions.length === 0) {
//     //                 return true;
//     //             }
//     //             // For the days that are included, ensure they have valid times
//     //             return sessions.every(session => 
//     //                 session.start_at && session.start_end
//     //             );
//     //         },
//     //         {
//     //             message: "Selected working days must have both start and end times"
//     //         }
//     //     )
//     // ])
// });

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
    // ... existing code ...
});