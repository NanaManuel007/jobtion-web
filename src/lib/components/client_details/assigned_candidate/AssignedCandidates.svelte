<script lang="ts">
    import { fly } from 'svelte/transition';
    import TMSDialog from './TMSDialog.svelte';
	import type { AppliedCandidate, SelectedClientType } from '$lib/services/client_services/client.type';
    
    const {client} = $props<{client:SelectedClientType}>();

// function handleViewTMS(job: AppliedCandidate) {
//     if (job.job_type === 'Temporary') {
//         selectedJob = {
//             id: job.job_id,
//             title: job.job_title,
//             location: job.company_name,
//             status: job.status,
//             candidates: [],
//             jobType: job.job_type,
//             temporaryType: job.employment_type
//         };
//         showTMSDialog = true;
//     }
// }

let appliedCandidate: AppliedCandidate[] = $derived(client?.applied_candidates);
console.log("applied data ",appliedCandidate)


let showTMSDialog = $state(false);
    let selectedJob: AppliedCandidate;
    let candidateId = $state(0);
    function handleViewTms(candidate: number) {
        const found = appliedCandidate.find(c => c.candidate_id === candidate);
        if (found) {
            selectedJob = found;
            candidateId = candidate;
            showTMSDialog = true;
        }
    }
    // function handleViewTms(candidate: number) {
    //     // Find the candidate from appliedCandidate array
    //     selectedJob = appliedCandidate.find(c => c.candidate_id === candidate);
    //     candidateId = candidate;
    //     showTMSDialog = true;
    // }
    interface Candidate {
        id: number;
        name: string;
        email: string;
        status: string;
    }

    interface Job {
        id: number;
        title: string;
        location: string;
        status: string;
        candidates: Candidate[];
        jobType: string;
        temporaryType: string | null;
    }

    let searchQuery = $state('');
    let selectedJobType = $state('all');
    let selectedStatus = $state('all');
    let currentPage = $state(1);
    const itemsPerPage = 10;
    let totalPages = $state(1);
    let filteredJobs = $state<AppliedCandidate[]>([]);
        $effect(() => {
    // Early return if no data
    if (!appliedCandidate || !Array.isArray(appliedCandidate)) {
        filteredJobs = [];
        totalPages = 1;
        return;
    }
    
    // Cache these values to avoid repeated access
    const searchLower = searchQuery.toLowerCase();
    const jobTypeFilter = selectedJobType;
    const statusFilter = selectedStatus;
    
    // Do filtering only once
    const filtered = appliedCandidate.filter(candidate => {
        // Combine all conditions in a single evaluation to short-circuit when possible
        return (
            (searchLower === '' || 
             (candidate?.job_title?.toLowerCase() || '').includes(searchLower) || 
             (candidate?.email?.toLowerCase() || '').includes(searchLower)) &&
            (jobTypeFilter === 'all' || (candidate?.job_type || '') === jobTypeFilter) &&
            (statusFilter === 'all' || (candidate?.status || '') === statusFilter)
        );
    });

    console.log(filtered)
    
    // Calculate pagination values
    const newTotalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    totalPages = newTotalPages;
    
    // Ensure current page is valid (in a single calculation)
    currentPage = Math.min(Math.max(1, currentPage), newTotalPages);
    
    // Get the slice for the current page (only one slice operation)
    const startIndex = (currentPage - 1) * itemsPerPage;
    filteredJobs = filtered.slice(startIndex, Math.min(startIndex + itemsPerPage, filtered.length));
    // console.log("Filtered jobs:", filteredJobs)
});


function goToPage(page: number) {
        currentPage = Math.min(Math.max(1, page), totalPages);
    }

    const getJobTypeColor = (type: string) => {
        return type === 'Permanent' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';
    };

    const getTemporaryTypeColor = (type: string) => {
        const colors = {
            'Term Time': 'bg-gray-100 text-gray-700',
            'Part Time': 'bg-gray-100 text-gray-700',
            'After School': 'bg-gray-100 text-gray-700'
        };
        return colors[type as keyof typeof colors] || '';
    };


</script>

<div class="space-y-6">
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Assigned Candidates</h2>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white p-6 rounded-[15px] shadow-sm space-y-4">
        <div class="flex gap-4 items-center">
            <!-- Search Bar -->
            <div class="flex-1 relative">
                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search jobs..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                />
            </div>

            <!-- Job Type Filter -->
            <div class="min-w-[200px]">
                <select
                    bind:value={selectedJobType}
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                >
                    <option value="all">All Job Types</option>
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                </select>
            </div>

            <!-- Status Filter -->
            <div class="min-w-[200px]">
                <select
                    bind:value={selectedStatus}
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] overflow-hidden">
        {#if !appliedCandidate || appliedCandidate.length === 0}
        <div class="p-6 text-center text-gray-500">
            No candidates data available. Please check the client data structure.
        </div>
    {:else}
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="bg-gray-50">
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Candidate</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Job Title</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Job Type</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Candidates</th>
                    <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">TMS</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredJobs as job, i}
                    <tr 
                        class="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                        in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
                    >
                    <td class="px-6 py-4 text-gray-600">{job.first_name +" "+ job.last_name}</td>

                        <td class="px-6 py-4">
                            <div class="flex items-center">
                                <span class="material-icons-sharp text-gray-400 mr-2">work</span>
                                <span class="font-medium text-gray-800">{job?.job_title}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-600">{job.email}</td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col gap-2">
                                <span class="px-3 py-1 rounded-full text-sm font-medium inline-block w-fit
                                    {getJobTypeColor(job?.job_type)}">
                                    {job?.employment_type}
                                </span>
                                <!-- {#if job.job_type }
                                    <span class="px-3 py-1 rounded-full text-sm font-medium inline-block w-fit
                                        {getTemporaryTypeColor(job.temporaryType)}">
                                        {job.temporaryType}
                                    </span>
                                {/if} -->
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="px-3 py-1 rounded-full text-sm font-medium
                                {job?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                {job?.status}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-2">
                                <span class="material-icons-sharp text-gray-400">groups</span>
                                <span class="font-medium">1</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            {#if job?.job_type === 'Temporary'}
                                <button 
                                    class="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                    on:click={() => handleViewTms(job.candidate_id)}
                                >
                                    <span class="material-icons-sharp">timer</span>
                                    View TMS
                                </button>
                            {:else}
                                <span class="text-gray-400">Not Available</span>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>

        <!-- Pagination -->
        {#if appliedCandidate && appliedCandidate.length > 0 && totalPages > 0}
        <div class="flex items-center justify-between px-6 py-4 border-t">
            <div class="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, appliedCandidate.length)} of {appliedCandidate.length} entries
            </div>
                <div class="flex items-center gap-2">
                    <button 
                        class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === 1}
                        on:click={() => goToPage(currentPage - 1)}
                    >
                        <span class="material-icons-sharp">chevron_left</span>
                    </button>
                    
                    {#each Array(totalPages) as _, i}
                        <button 
                            class="min-w-[32px] h-8 rounded-lg transition-colors {currentPage === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}"
                            on:click={() => goToPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    {/each}
                    
                    <button 
                        class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === totalPages}
                        on:click={() => goToPage(currentPage + 1)}
                    >
                        <span class="material-icons-sharp">chevron_right</span>
                    </button>
                </div>
            </div>
        {/if}
    </div>
    {/if}
       
        {#if showTMSDialog }
    <TMSDialog 
    clientId = {client?.client.id}
        showDialog={showTMSDialog}
        candidateId = {candidateId}
        job={selectedJob}
        on:close={() => showTMSDialog = false}
    />
{/if}
    </div>
</div>