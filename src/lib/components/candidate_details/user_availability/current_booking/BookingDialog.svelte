<script lang="ts">
       import { onMount } from 'svelte';
    import { jobs, jobActions } from '$lib/services/job_services/job.store';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
	import type { BookJob } from '$lib/services/job_services/job.type';
    
    
    export let showDialog = false;
    export let onClose = () => {};
    export let onAssign = (job: { jobId: number; candidateId: number }) => {};
    export let candidateId: number;
    export let candidateName: string;


    let isLoading = false;
    let errorMessage = '';
    let availableJobs: any[] = [];
    let loadingJobId: number | null = null;

    
    // Filter jobs to only show temporary jobs
    const loadTemporaryJobs = () => {
        const allJobs = $jobs;
        availableJobs = allJobs.filter(job => job.job_type === 'Temporary').map(job => ({
            id: job.id,
            title: job.job_title,
            type: job.job_type,
            duration: job.hours || '8', 
            hours: job.hours || 40,
            pricePerHour: job.amount || 22,
            pricePerDay: (job.amount * 8) || 160, // Assuming 8 hours per day
            location: job.job_location || 'UK',
            jobType: job.job_type,
        }));
    };
    
    // Load jobs when component mounts or when the jobs store changes
    $: if ($jobs) {
        loadTemporaryJobs();
    }
    // async function handleAssign(jobId: number) {
    //     loadingJobId =jobId;
    //     errorMessage = '';
        
    //     try {
    //         const bookingData = {
    //             jobId: jobId,
    //             candidateId: candidateId
    //         };
            
    //         console.log("this job",bookingData)
            
    //         const result = await jobActions.createBooking(bookingData);
            
    //         if (result.success) {
    //             await candidateStore.refreshCandidateData(candidateId);
    //             onAssign(bookingData);
    //             onClose();
    //         } else {
    //             errorMessage = result.error || 'Failed to create booking';
    //         }
    //     } catch (error) {
    //         errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the booking';
    //     } finally {
    //         loadingJobId = null;
    //     }
    // }
    onMount(() => {
        // Fetch all jobs when component mounts
        jobActions.getAllJobs();
    });
</script>

{#if showDialog}
    <div tabindex="-1"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]"
        role="dialog"
        on:click={onClose}
        on:keydown={e => e.key === 'Escape' && onClose()}
    >
        <div
            tabindex="0"
            on:keydown={e => e.key === 'Enter' && onClose()}
            class="bg-white rounded-3xl w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto"
            role="dialog"
            on:click|stopPropagation
        >
            <!-- Header -->
            <div class="p-6 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Available Temporary Jobs</h2>
                        <p class="text-sm text-gray-600 mt-1">Select a job to assign to {candidateName}</p>
                    </div>
                    <button 
                        class="p-2 hover:bg-gray-100 rounded-full transition-all duration-300"
                        on:click={onClose}
                    >
                        <span class="material-icons-sharp text-gray-600">close</span>
                    </button>
                </div>
            </div>

            <!-- Job List -->
            <div class="p-6">
                {#if availableJobs.length === 0}
                    <div class="text-center py-8 text-gray-500">
                        <span class="material-icons-sharp text-4xl mb-2">work_off</span>
                        <p>No temporary jobs available</p>
                    </div>
                {:else}
                    <div class="space-y-4">
                        {#each availableJobs as job}
                            <div class="border rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                <div class="flex justify-between items-start">
                                    <div class="space-y-2">
                                        <div>
                                            <h3 class="font-medium text-gray-900">{job.title}</h3>
                                            <p class="text-sm text-gray-600">{job.jobType}</p>
                                        </div>
                                        <div class="flex items-center gap-2 text-sm text-gray-600">
                                            <span class="material-icons-sharp text-sm">location_on</span>
                                            {job.location}
                                        </div>
                                        <div class="flex flex-wrap gap-3">
                                            <span class="text-sm text-gray-600">• {job.jobType}</span>
                                            <span class="text-sm text-gray-600">• {job.duration}</span>
                                            <span class="text-sm text-gray-600">• {job.hours}h</span>
                                        </div>
                                        <div class="flex gap-4">
                                            <div class="text-sm">
                                                <span class="text-gray-500">Per hour:</span>
                                                <span class="font-medium text-gray-900">£{job.pricePerHour}</span>
                                            </div>
                                            <div class="text-sm">
                                                <span class="text-gray-500">Per day:</span>
                                                <span class="font-medium text-gray-900">£{job.pricePerDay}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                    class="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                                    on:click={() => onAssign({ jobId: job.id, candidateId })}
                                    disabled={loadingJobId === job.id}
                                >
                                    {#if loadingJobId === job.id}
                                        <span class="material-icons-sharp animate-spin">refresh</span>
                                    {:else}
                                        Assign
                                    {/if}
                                </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}