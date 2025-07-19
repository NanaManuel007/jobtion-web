<script lang="ts">
    import { fly } from 'svelte/transition';
    import AddJobDialog from './AddJobDialog.svelte';
    import type { ClientsType,SelectedClientType } from '$lib/services/client_services/client.type';
    import type { JobData, JobResponse, PermanentJobAPI } from '$lib/services/job_services/job.type';
    // Update to use permanent jobs with pagination
    import { permanentJobs, jobActions, isPermanentJobsLoading, permanentJobsPagination } from '$lib/services/job_services/job.store';
    import JobDetailsDialog from './JobDetailsDialog.svelte';
    
    let showJobDetailsDialog = $state(false);
    const {client} = $props<{client:SelectedClientType}>();
    let hasInitialLoad = $state(false);

$effect(() => {
    if (!hasInitialLoad) {
        // Initial load
        loadPermanentJobs(1, 10);
        hasInitialLoad = true;
    } else if (searchQuery !== undefined) {
        // Debounced search for subsequent changes
        const timeoutId = setTimeout(() => {
            loadPermanentJobs(1, 10, searchQuery);
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }
});



    // Update to use API pagination
async function loadPermanentJobs(page: number = 1, pageSize: number = 10, search?: string) {
    try {
        await jobActions.getPermanentJobs(page, pageSize, client.id.toString(), search);
    } catch (error) {
        console.error('Failed to load permanent jobs:', error);
    }
}
    


    function handleViewJobDetails(job: PermanentJobAPI) {
        selectedJob = job;
        showJobDetailsDialog = true;
    }
    
//  $effect(() => {
//     // Debounce search to avoid too many API calls
//     const timeoutId = setTimeout(() => {
//         loadPermanentJobs(1, 10, searchQuery);
//     }, 300);
    
//     return () => clearTimeout(timeoutId);
// });
    
    let showAddJobDialog = $state(false);
    let searchQuery = $state('');
    let selectedJobType = $state('all');
    let selectedStatus = $state('all');
    let isAddingJob = $state(false);
    let showCandidatesDialog = $state(false);
    let selectedJob = $state<PermanentJobAPI | null>(null);
    let isEditMode = $state(false);
 
    
    // Update pagination to work with API
async function goToPage(page: number) {
    await loadPermanentJobs(page, $permanentJobsPagination.pageSize, searchQuery);
    
    // Add scroll to top of table content
    const tableContent = document.querySelector('.overflow-auto');
    if (tableContent) {
        tableContent.scrollTop = 0;
    }
}


    async function handleAddJob(event: CustomEvent<{jobData: JobData}>) {
        try {
            isAddingJob = true;
            await loadPermanentJobs();
            showAddJobDialog = false;
            isEditMode = false;
        } catch (error) {
            console.error('Error adding job:', error);
        } finally {
            isAddingJob = false;
        }
    }

    function handleEditJob(job: PermanentJobAPI) {
        selectedJob = job;
        isEditMode = true;
        showAddJobDialog = true;
    }
    
    function handleManageCandidates(job: PermanentJobAPI) {
        selectedJob = job;
        showCandidatesDialog = true;
    }
    
    const getJobTypeColor = (type: string) => 
        type === 'Permanent' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';

    const getTemporaryTypeColor = (type: string) => {
        const colors = {
            'Term Time': 'bg-gray-100 text-gray-700',
            'Part Time': 'bg-gray-100 text-gray-700',
            'After School': 'bg-gray-100 text-gray-700'
        };
        return colors[type as keyof typeof colors] || '';
    };


</script>

<style>
    :global(*) {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    :global(*::-webkit-scrollbar) {
        display: none;
    }
</style>

<div class="mb-6 bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px]">
    <!-- Fixed header section -->
    <div class="sticky top-0 bg-white z-20  pt-5">
        <div class="flex justify-between items-center mb-8 px-5">
            <h2 class="text-2xl font-bold text-gray-800">Jobs Added</h2>
            <button 
                class="bg-gray-500 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 transform scale-100 shadow-md hover:bg-gray-600"
                on:click|stopPropagation={() => showAddJobDialog = true}
            >
                <span class="material-icons-sharp">add_circle</span>
                <span>Add New Job</span>
            </button>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm mt-4 mb-4">
            <div class="flex gap-4 items-center">
                <div class="flex-1 relative">
                    <span class="material-icons-sharp absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                    <input 
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search jobs..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                </div>

                <div class="min-w-[200px]">
                    <select
                        bind:value={selectedJobType}
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <option value="all">All Job Types</option>
                        <option value="Permanent">Permanent</option>
                        <option value="Temporary">Temporary</option>
                    </select>
                </div>

                <div class="min-w-[200px]">
                    <select
                        bind:value={selectedStatus}
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Fixed table header -->
        <div class="bg-gray-50 border-b border-gray-200">
            <div class="grid grid-cols-12 w-full min-w-[1200px]">
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Job Title</div>
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Location</div>
                <div class="p-6 text-center flex justify-start text-sm font-semibold text-gray-600 col-span-2">Job Type</div>
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-1">Status</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Roles</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Posted Date</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Publish</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Actions</div>
            </div>
        </div>
    </div>
    {#if showJobDetailsDialog && selectedJob}
    <JobDetailsDialog 
        bind:showDialog={showJobDetailsDialog}
        job={selectedJob}
        onClose={() => {
            showJobDetailsDialog = false;
            selectedJob = null;
        }}
    />
{/if}
    <!-- Scrollable content section -->
    <!-- Update the job list rendering section -->
    <div class="overflow-auto max-h-[calc(100vh-400px)]">
        {#if $isPermanentJobsLoading}
        <div class="flex flex-col items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-600">Loading permanent jobs...</p>
        </div>
    {:else if $permanentJobs.length === 0}
        <div class="flex flex-col items-center justify-center py-20">
            <span class="material-icons-sharp text-gray-400 text-5xl mb-4">work_off</span>
            <p class="text-gray-600">No permanent jobs found</p>
        </div>
    {:else}
            {#each $permanentJobs as job, i}
            <div 
                class="grid grid-cols-12 w-full border-t border-gray-100 transition-colors hover:bg-gray-50"
                in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
            >
                <div class="p-6 col-span-2 items-center justify-start flex">
                    <div class="flex items-center">
                        <span class="material-icons-sharp text-gray-400 mr-2">work</span>
                        <span class="font-medium text-gray-800 truncate max-w-[200px]" title="{job.jobTitle}">{job.jobTitle}</span>
                    </div>
                </div>
                <div class="p-6 text-gray-600 flex col-span-2 justify-start items-start">{job.jobLocation}</div>
                <div class="p-6 col-span-2 flex justify-start items-start">
                    <div class=" gap-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium inline-block w-fit bg-gray-100 text-gray-700">
                            {job.jobType} ({job.employmentType})
                        </span>
                    </div>
                </div>
                <div class="p-6 col-span-1">
                    <span class="rounded-full text-sm font-medium text-center items-center justify-center bg-green-100 text-green-700">
                        Active
                    </span>
                </div>
                <div class=" py-6 items-center justify-items-center col-span-1">
                    <button 
                        class="text-gray-500 font-medium flex items-center gap-1 hover:text-gray-700 justify-items-center"
                        on:click={() => handleManageCandidates(job)}
                    >
                        <span class="material-icons-sharp text-sm">person_add</span>
                    </button>
                </div>
                <div class="p-6 text-gray-600 col-span-2 text-center">{job.timeOfPostingJob?.split('T')[0] || 'N/A'}</div>
                <div class="p-6 text-gray-600 col-span-1 text-center">
                    <!-- Simplified toggle for now - you can implement publish functionality later -->
                    <span class="inline-block w-4 h-4 transform bg-green-500 rounded-full"></span>
                </div>

                <div class="p-6 col-span-1 pl-2 pr-2">
                    <div class="flex items-center gap-1 pr-2">
                        <button 
                            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            on:click={() => handleEditJob(job)}
                        >
                            <span class="material-icons-sharp text-gray-600">edit</span>
                        </button>
                        <button class="p-2 hover:bg-gray-100 rounded-full transition-colors" on:click={() => handleViewJobDetails(job)}>
                            <span class="material-icons-sharp text-gray-600">visibility</span>
                        </button>
                        <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <span class="material-icons-sharp text-gray-600">delete</span>
                        </button>
                    </div>
                </div>
            </div>
            {/each}
            
        {/if}
    </div>
</div>
<AddJobDialog 
    bind:showDialog={showAddJobDialog}
    on:addJob={handleAddJob}
    clientId={client.id}
    on:close={() => {
        showAddJobDialog = false;
        isEditMode = false;
    }}
    isEditMode={isEditMode}
    jobToEdit={selectedJob}
/>
<!-- Update the pagination section to use API pagination data -->
<!-- This is the correct pagination section that should remain -->
{#if $permanentJobsPagination.totalPages > 0}
    <div class="flex items-center justify-between px-6 py-4 border-t">
        <div class="text-sm text-gray-600">
            Showing {($permanentJobsPagination.currentPage - 1) * $permanentJobsPagination.pageSize + 1} to {Math.min($permanentJobsPagination.currentPage * $permanentJobsPagination.pageSize, $permanentJobsPagination.totalCount)} of {$permanentJobsPagination.totalCount} entries
        </div>
        <div class="flex items-center gap-2">
            <button 
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={$permanentJobsPagination.currentPage === 1}
                on:click={() => goToPage($permanentJobsPagination.currentPage - 1)}
            >
                <span class="material-icons-sharp">chevron_left</span>
            </button>
            
            {#each Array($permanentJobsPagination.totalPages) as _, i}
                <button 
                    class={`min-w-[32px] h-8 rounded-lg transition-colors ${$permanentJobsPagination.currentPage === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    on:click={() => goToPage(i + 1)}
                >
                    {i + 1}
                </button>
            {/each}
            
            <button 
                class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={$permanentJobsPagination.currentPage === $permanentJobsPagination.totalPages}
                on:click={() => goToPage($permanentJobsPagination.currentPage + 1)}
            >
                <span class="material-icons-sharp">chevron_right</span>
            </button>
        </div>
    </div>
{/if}

