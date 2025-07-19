
<script lang="ts">
    import { JobService } from '$lib/services/job_services/job.services';
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import { type JobData } from '$lib/services/job_services/job.type';
    import JobBasicInfo from './JobBasicInfo.svelte';
    import JobDuties from '$lib/components/client_details/add_job_jobs_added/JobDuties.svelte';
    import JobRequirements from '$lib/components/client_details/add_job_jobs_added/JobRequirements.svelte';
    import JobDetails from '$lib/components/client_details/add_job_jobs_added/JobDetails.svelte';
    import Toast from '$lib/components/general_components/Toast.svelte';

    const dispatch = createEventDispatcher();
    const { clientId, showDialog = $bindable(false), isEditMode = $bindable(false), jobToEdit = $bindable(null) } = $props<{
        clientId: string,
        showDialog?: boolean,
        isEditMode?: boolean,
        jobToEdit?: any
    }>();

    let toastShow = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let isLoading = $state(false);
    let errors = $state<{ [key: string]: string }>({});

    let jobData = $state<JobData>({
        jobTitle: '',
        clientId: clientId.toString(),
        paymentType: '',
        amount: 0,
        jobType: 'Permanent',
        employmentType: '',
        jobLocation: '',
        hours: 0,
        duty1: '',
        duty2: '',
        duty3: '',
        duty4: '',
        requirement1: '',
        requirement2: '',
        requirement3: '',
        requirement4: '',
        position: '',
        jobDescription: '',
        jobRequirement: '',
        postedStartDate: new Date().toISOString(),
        postedRoles: 0,
        isPublished: false
    });

    // Reset form when dialog closes
    $effect(() => {
        if (!showDialog) {
            jobData = {
                jobTitle: '',
                clientId: clientId.toString(),
                paymentType: '',
                amount: 0,
                jobType: 'Permanent',
                employmentType: '',
                jobLocation: '',
                hours: 0,
                duty1: '',
                duty2: '',
                duty3: '',
                duty4: '',
                requirement1: '',
                requirement2: '',
                requirement3: '',
                requirement4: '',
                position: '',
                jobDescription: '',
                jobRequirement: '',
                postedStartDate: new Date().toISOString(),
                postedRoles: 0,
                isPublished: false
            };
            errors = {};
        }
    });

    // Initialize edit mode
    $effect(() => {
        if (isEditMode && jobToEdit) {
            jobData = {
                jobTitle: jobToEdit.jobTitle || '',
                clientId: clientId.toString(),
                paymentType: jobToEdit.paymentType || '',
                amount: jobToEdit.amount || 0,
                jobType: 'Permanent',
                employmentType: jobToEdit.employmentType || '',
                jobLocation: jobToEdit.jobLocation || '',
                hours: jobToEdit.hours || 0,
                duty1: jobToEdit.duty1 || '',
                duty2: jobToEdit.duty2 || '',
                duty3: jobToEdit.duty3 || '',
                duty4: jobToEdit.duty4 || '',
                requirement1: jobToEdit.requirement1 || '',
                requirement2: jobToEdit.requirement2 || '',
                requirement3: jobToEdit.requirement3 || '',
                requirement4: jobToEdit.requirement4 || '',
                position: jobToEdit.position || '',
                jobDescription: jobToEdit.jobDescription || '',
                jobRequirement: jobToEdit.jobRequirement || '',
                postedStartDate: jobToEdit.postedStartDate || new Date().toISOString(),
                postedRoles: jobToEdit.postedRoles || 0,
                isPublished: jobToEdit.isPublished || false
            };
        }
    });

    function validateForm() {
        errors = {};
        let isValid = true;

        if (!jobData.jobTitle.trim()) {
            errors.jobTitle = 'Job title is required';
            isValid = false;
        }
        if (!jobData.paymentType.trim()) {
            errors.paymentType = 'Payment type is required';
            isValid = false;
        }
        if (jobData.amount <= 0) {
            errors.amount = 'Amount must be greater than 0';
            isValid = false;
        }
        if (!jobData.employmentType.trim()) {
            errors.employmentType = 'Employment type is required';
            isValid = false;
        }
        if (!jobData.jobLocation.trim()) {
            errors.jobLocation = 'Job location is required';
            isValid = false;
        }
        if (!jobData.duty1.trim()) {
            errors.duty1 = 'At least one duty is required';
            isValid = false;
        }
        if (!jobData.requirement1.trim()) {
            errors.requirement1 = 'At least one requirement is required';
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();
        
        const isValid = validateForm();
        if (!isValid) {
            toastType = 'error';
            toastMessage = Object.values(errors).join(', ');
            toastShow = true;
            return;
        }

        try {
            isLoading = true;
            
            if (isEditMode && jobToEdit) {
                await JobService.updateJob(jobToEdit.id, jobData, clientId.toString());
                toastMessage = 'Job updated successfully';
            } else {
                await JobService.createJob(jobData, clientId.toString());
                toastMessage = 'Job added successfully';
            }
            
            toastType = 'success';
            toastShow = true;
            dispatch('addJob', { jobData });
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
            </div>
        </form>
    </div>
</div>
{/if}

