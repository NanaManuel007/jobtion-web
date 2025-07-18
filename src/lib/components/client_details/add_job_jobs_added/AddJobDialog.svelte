
<script lang="ts">
    import { JobService } from '$lib/services/job_services/job.services';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { jobSchema } from '$lib/services/job_services/job.validation';
    import { type JobData, type DaySession, jobTypes } from '$lib/services/job_services/job.type';
    import JobBasicInfo from './JobBasicInfo.svelte';
    import WorkingHours from './WorkingHours.svelte';
    import JobDuties from '$lib/components/client_details/add_job_jobs_added/JobDuties.svelte';
    import JobRequirements from '$lib/components/client_details/add_job_jobs_added/JobRequirements.svelte';
    import JobDetails from '$lib/components/client_details/add_job_jobs_added/JobDetails.svelte';
    import { z } from 'zod';
    import Toast from '$lib/components/general_components/Toast.svelte';

    type UIJobData = JobData & {
        workingHours: {
            sunday: DaySession;
            monday: DaySession;
            tuesday: DaySession;
            wednesday: DaySession;
            thursday: DaySession;
            friday: DaySession;
            saturday: DaySession;
        };
    };

    const dispatch = createEventDispatcher();
    const { clientId, showDialog = $bindable(false), isEditMode = $bindable(false), jobToEdit = $bindable(null) } = $props<{
        clientId: number,
        showDialog?: boolean,
        isEditMode?: boolean,
        jobToEdit?: any
    }>();

    let toastShow = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let isLoading = $state(false);
    let errors = $state<{ [key: string]: string }>({});

    let jobData = $state<UIJobData>({
        job_title: '',
        payment_type: '',
        amount: 0,
        // from_amount: 0,
        // to_amount: 0,
        job_type: 'Permanent',
        employment_type: '',
        job_location: '',
        hours: 0,
        duty_1: '',
        duty_2: '',
        duty_3: '',
        duty_4: '',
        requirment_1: '',
        requirment_2: '',
        requirment_3: '',
        requirment_4: '',
        company_id: clientId,
        posted_start_date: '',
        posted_roles: 0,
        publish: 0,
        location:'',
        roles:0,
        workingHours: {
            sunday: { day: 'sunday', start_at: '', start_end: '' },
            monday: { day: 'monday', start_at: '', start_end: '' },
            tuesday: { day: 'tuesday', start_at: '', start_end: '' },
            wednesday: { day: 'wednesday', start_at: '', start_end: '' },
            thursday: { day: 'thursday', start_at: '', start_end: '' },
            friday: { day: 'friday', start_at: '', start_end: '' },
            saturday: { day: 'saturday', start_at: '', start_end: '' }
        }
    });

    // let showWorkingHours = $derived(jobData.job_type === 'Temporary');

    // Reset form when dialog closes
    $effect(() => {
        if (!showDialog) {
            jobData = {
                job_title: '',
                payment_type: '',
                amount: 0,
                // from_amount: 0,
                // to_amount: 0,
                job_type: 'Permanent',
                employment_type: '',
                job_location: '',
                hours: 0,
                duty_1: '',
                duty_2: '',
                duty_3: '',
                duty_4: '',
                requirment_1: '',
                requirment_2: '',
                requirment_3: '',
                requirment_4: '',
                company_id: clientId,
                posted_start_date: '',
                posted_roles: 0,
                roles:0,
                location:'',
                publish: 0,
                workingHours: {
            sunday: { day: 'sunday', start_at: '', start_end: '' },
            monday: { day: 'monday', start_at: '', start_end: '' },
            tuesday: { day: 'tuesday', start_at: '', start_end: '' },
            wednesday: { day: 'wednesday', start_at: '', start_end: '' },
            thursday: { day: 'thursday', start_at: '', start_end: '' },
            friday: { day: 'friday', start_at: '', start_end: '' },
            saturday: { day: 'saturday', start_at: '', start_end: '' }
        }
            };
            errors = {};
        }
    });

    // Initialize edit mode
    $effect(() => {
    if (isEditMode && jobToEdit) {
        // Convert day_session to workingHours format
        const workingHours = {
            sunday: { day: 'sunday', start_at: '', start_end: '' },
            monday: { day: 'monday', start_at: '', start_end: '' },
            tuesday: { day: 'tuesday', start_at: '', start_end: '' },
            wednesday: { day: 'wednesday', start_at: '', start_end: '' },
            thursday: { day: 'thursday', start_at: '', start_end: '' },
            friday: { day: 'friday', start_at: '', start_end: '' },
            saturday: { day: 'saturday', start_at: '', start_end: '' }
        };

        if (jobToEdit.day_session) {
            Object.entries(jobToEdit.day_session).forEach((entry) => {
                const [key, value] = entry as [string, { start_at: string; start_end: string }];
                if (key in workingHours) {
                    workingHours[key as keyof typeof workingHours] = {
                        day: key,
                        start_at: value.start_at,
                        start_end: value.start_end
                    };
                }
            });
        }

        jobData = {
            ...jobToEdit,
            workingHours
        };
    }
});
    $effect(() => {
        if (jobData.job_type === 'Temporary') {
            const days_sessions: DaySession[] = Object.entries(jobData.workingHours)
                .filter(([_, value]) =>value.start_at && value.start_end)
                .map(([day, value]) => ({
                    day:day.toLowerCase(),
                    start_at: value.start_at,
                    start_end: value.start_end
                }));
            
            if (!jobData.days_sessions || 
                JSON.stringify(jobData.days_sessions) !== JSON.stringify(days_sessions)) {
                jobData = {
                    ...jobData,
                    days_sessions
                };
            }
        }
    });

    function validateForm() {
    try {
        jobSchema.parse(jobData);
        errors = {};
        return true;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log('Validation Errors:', JSON.stringify(error.errors, null, 2));
            errors = error.errors.reduce((acc, curr) => {
                // Get the full path as a string
                const path = curr.path.join('.');
                // Include more error details
                acc[path] = `${curr.message} (${curr.code})`;
                return acc;
            }, {} as { [key: string]: string });
            
            // Log the formatted errors object
            console.log('Formatted Errors:', errors);
        }
        return false;
    }
}

function prepareJobDataForSubmission(): JobData {
    const { workingHours, ...baseData } = jobData;
    
    if (jobData.job_type === 'Temporary' && workingHours) {
        const days_sessions = Object.entries(workingHours)
            .filter(([_, value]) => value.start_end && value.start_end) // Filter out empty entries
            .map(([day, value]) => ({
                day: day.toLowerCase(), 
                start_at: value.start_at,
                start_end: value.start_end
            }));
        
        // Log the selected day sessions
        console.log('Selected Day Sessions:', days_sessions);
        console.table(days_sessions); // This will show the data in a nice table format
        
        return {
            ...baseData,
            company_id: clientId,
            job_type: 'Temporary',
            days_sessions
        };
    }
    
    return {
        ...baseData,
        company_id: clientId,
        job_type: 'Permanent'
    } as JobData;
}

    async function handleSubmit(event: Event) {
    event.preventDefault();
    

    
    const isValid = validateForm();
    if (!isValid) {
        // Log the complete error object
        console.log('Complete validation errors:', errors);
        toastType = 'error';
        toastMessage = Object.values(errors).join(', ');
        toastShow = true;
        
        // Scroll to first error if any
        const firstError = document.querySelector('[data-error]');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    console.log("I am clicked");
    try {
        isLoading = true;
        const submissionData = prepareJobDataForSubmission();
        
        if (isEditMode && jobToEdit) {
            await JobService.updateJob(jobToEdit.id, submissionData);
            toastMessage = 'Job updated successfully';
        } else {
            await JobService.createJob(submissionData);
            toastMessage = 'Job added successfully';
        }
        
        toastType = 'success';
        toastShow = true;
        dispatch('addJob', { jobData: submissionData });
        dispatch('closeDialog');
    } catch (error) {
        console.error('Error submitting job:', error);
        toastType = 'error';
        toastMessage = 'Failed to save job: ' + (error instanceof Error ? error.message : 'Unknown error');
        toastShow = true;
    } finally {
        isLoading = false;
    }
}
</script>

{#if showDialog}
<div class="fixed inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-50" transition:fade>
    <Toast 
    bind:show={toastShow}
    message={toastMessage}
    type={toastType}
/>
    <div class="bg-white rounded-[15px] px-8 w-[1200px] max-h-[90vh] overflow-y-auto shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] relative">
        <form on:submit|preventDefault={handleSubmit}>
            <div class="sticky top-0 bg-white z-10 py-6 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Job' : 'Add New Job'}</h2>
                    <div class="flex justify-end gap-4">
                        <button
                            type="button"
                            class="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            on:click={() => { dispatch('close');}}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {#if isLoading}
                                <span class="material-icons-sharp animate-spin text-sm">refresh</span>
                            {/if}
                            {isLoading ? (isEditMode ? "Updating Job..." : "Adding Job...") : (isEditMode ? "Update Job" : "Add Job")}
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex gap-8 pb-10 pt-5">
                <div class="flex-1">
                    <div class="space-y-6">
                        <JobBasicInfo bind:jobData {errors} />
                        <JobDuties bind:jobData {errors} />
                        <JobRequirements bind:jobData {errors} />
                        <JobDetails bind:jobData {errors} />
                    </div>
                </div>

                {#if jobData.job_type === 'Temporary'}
                    <div class="w-96 flex-shrink-0">
                        <WorkingHours bind:workingHours={jobData.workingHours} />
                    </div>
                {/if}
            </div>
        </form>
    </div>
</div>
{/if}

