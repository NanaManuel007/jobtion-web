
<script lang="ts">
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import TMSDialog from '../client_details/pending_approvals/TMSDialog.svelte';
    import { tsms, isLoading, error, tsmActions } from '$lib/services/tsm_services/job.tsm.store';
    import type { TSM,Approval } from '$lib/services/tsm_services/job.tsm.types';
	import type { SelectedClientType } from '$lib/services/client_services/client.type';
	// import { TSMService } from '$lib/services/tsm_services/job.tsm.services';
	// import { candidateStore } from '$lib/services/candidate_services/candidate.store';

    const {client} = $props<{client:SelectedClientType}>();
    // State variables
    let showTMSDialog = $state(false);
    let selectedApproval = $state<Approval | null>(null);
    let startDate = $state('');
    let endDate = $state('');
    let searchQuery = $state('');
    let selectedJobType = $state('all');
    let selectedStatus = $state('all');
    let currentPage = $state(1);
    const itemsPerPage = 10;
    let totalPages = $state(1);
    let filteredApprovals = $state<Approval[]>([]);

    let approvals = $state<Approval[]>([]);
        interface UserTimesheet {
		userId: number;
		timeEntries: TimeEntry[];
	}
    interface TimeEntry {
		day: string;
		date: string;
		startTime: string;
		tsm_id: number;
		endTime: string;
		breakTime: string;
		amount: number;
		status: number;
	}
    let userTimesheets: Record<number, UserTimesheet> = $state({});


    // Fetch data on mount
    onMount(() => {
        tsmActions.fetchAllTSMs();
    });


    // Convert TSM data to Approval format
    function convertTSMsToApprovals(tsmData: TSM[]): Approval[] {
        return tsmData
            .filter(tsm => tsm.break_time_updated === 1 || tsm.break_time_updated === 0)
            .map(tsm => ({
                id: tsm.id,
                candidateName: `${tsm.first_name} ${tsm.last_name}`,
                candidateEmail: tsm.email,
                jobRole: tsm.job_title,
                jobType: 'Temporary',
                approvalType: 'Time Sheet',
                status: tsm.break_time_updated === 2 ? 'Active' : 'Pending',
                totalAmount: tsm.amount,
                date: tsm.day,
                submittedStartTime: tsm.start,
                submittedEndTime: tsm.end,
                submittedBreakTime: tsm.break_time,
                startTime: tsm.start,
                endTime: tsm.end,
                breakTime: tsm.break_time,
                tsmData: tsm
            }));
    }

    // Apply filters and pagination
    function applyFilters() {
        let filtered = [...approvals];
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(approval => 
                approval.candidateName.toLowerCase().includes(query) ||
                approval.candidateEmail.toLowerCase().includes(query) ||
                approval.jobRole.toLowerCase().includes(query)
            );
        }
        
        if (selectedJobType !== 'all') {
            filtered = filtered.filter(approval => approval.jobType === selectedJobType);
        }
        
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(approval => approval.status === selectedStatus);
        }
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filtered = filtered.filter(approval => {
                const approvalDate = new Date(approval.date);
                return approvalDate >= start && approvalDate <= end;
            });
        }
        
        totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        
        if (currentPage > totalPages) {
            currentPage = totalPages;
        }
        
        filteredApprovals = filtered.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }

    // React to TSM store changes
    $effect(() => {
        if ($tsms) {
            approvals = convertTSMsToApprovals($tsms);
        }
    });

    // React to filter and TSM changes
    $effect(() => {
        applyFilters();
    });

    function handleView(approval: Approval) {
        selectedApproval = approval;
        showTMSDialog = true;
    }

    function goToPage(page: number) {
        currentPage = Math.min(Math.max(1, page), totalPages);
    }
</script>
<div class="space-y-6">
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Pending Approvals</h2>
    </div>

    <!-- Error message -->
    {#if $error}
        <div class="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {$error}
        </div>
    {/if}

    <!-- Search and Filter Section -->
    <div class="bg-white p-6 rounded-[15px] shadow-sm space-y-4">
        <div class="flex gap-4 items-center flex-wrap">
            <!-- Search Bar -->
            <div class="flex-1 relative min-w-[200px]">
                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search approvals..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                />
            </div>

            <!-- Job Type Filter -->
            <div class="min-w-[150px]">
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
            <div class="min-w-[150px]">
                <select
                    bind:value={selectedStatus}
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>

            <!-- Date Filter -->
            <div class="flex gap-2 min-w-[300px]">
                <div class="flex-1">
                    <label class="text-sm text-gray-500 block mb-1">From</label>
                    <input 
                        type="date"
                        bind:value={startDate}
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                    />
                </div>
                <div class="flex-1">
                    <label class="text-sm text-gray-500 block mb-1">To</label>
                    <input 
                        type="date"
                        bind:value={endDate}
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-50">
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Candidate Name</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Job Role</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Job Type</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Approval</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each filteredApprovals as approval, i}
                        <tr 
                            class="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                            in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
                        >
                            <td class="px-6 py-4">
                                <div class="flex items-center">
                                    <span class="material-icons-sharp text-gray-400 mr-2">person</span>
                                    <span class="font-medium text-gray-800">{approval.candidateName}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{approval.candidateEmail}</td>
                            <td class="px-6 py-4 text-gray-600">{approval.jobRole}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                    {approval.jobType}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{approval.approvalType}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-sm font-medium
                                    {approval.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                    {approval.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-medium text-gray-800">£{approval.totalAmount}</td>
                            <td class="px-6 py-4 text-gray-600">{approval.date}</td>
                            <td class="px-6 py-4">
                                <button 
                                    class="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                    on:click={() => handleView(approval)}
                                >
                                    <span class="material-icons-sharp">visibility</span>
                                    View
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>

            <!-- Empty state -->
            {#if filteredApprovals.length === 0 && !$isLoading}
                <div class="text-center py-8">
                    <span class="material-icons-sharp text-4xl text-gray-400">assignment</span>
                    <p class="text-gray-600 mt-2">No approvals found</p>
                </div>
            {/if}

            <!-- Pagination -->
            {#if totalPages > 0}
                <div class="flex items-center justify-between px-6 py-4 border-t">
                    <div class="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, approvals.length)} of {approvals.length} entries
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
    </div>
</div>

{#if showTMSDialog && selectedApproval}
    <TMSDialog 
        showDialog={showTMSDialog}
        approval={selectedApproval}
        onClose={() => {
            showTMSDialog = false;
            selectedApproval = null;
        }}
    />
{/if}