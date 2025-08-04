<script lang="ts">
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { JobService } from '$lib/services/job_services/job.services';
    import type { WeeklyTimesheetAPI, InternalJobAPI } from '$lib/services/job_services/job.type';
    import TimesheetDetailsDialog from '$lib/components/client_details/add_job_jobs_added/TimesheetDetailsDialog.svelte';
    import AddInternalJobDialog from '$lib/components/client_details/add_job_jobs_added/AddInternalJobDialog.svelte';
    // Add WeeklyTimesheetDialog import
    import WeeklyTimesheetDialog from '$lib/components/client_details/add_job_jobs_added/WeeklyTimesheetDialog.svelte';
    import { jobActions, internalJobs, isInternalJobsLoading, internalJobsPagination } from '$lib/services/job_services/job.store';
    import { clientActions, clients } from '$lib/services/client_services/client.store';
    import type { ClientsType } from '$lib/services/client_services/client.type';

    // State variables
    let timesheets: WeeklyTimesheetAPI[] = [];
    let filteredTimesheets: WeeklyTimesheetAPI[] = [];
    let isTimesheetsLoading = $state(false);
    let timesheetSearchQuery = $state('');
    let selectedStatus = $state<'pending' | 'completed' | 'client-requested'>('pending');
    let currentPage = $state(1);
    let pageSize = $state(10);
    let totalPages = $state(1);
    let totalCount = $state(0);
    
    // Add dialog state variables
    let showTimesheetDetailsDialog = $state(false);
    let selectedTimesheet: WeeklyTimesheetAPI | null = $state(null);
    // Add weekly timesheet dialog state
    let showWeeklyTimesheetDialog = $state(false);
    
    // Add internal jobs state
    let internalJobsData = $state<InternalJobAPI[]>([]);
    let internalJobsLoadingState = $state(false);
    let internalJobsCurrentPage = $state(1);
    let internalJobsTotalPages = $state(1);
    let internalJobsTotalCount = $state(0);
    let internalJobsSearchQuery = $state('');
    // Remove this line: const jobService = new JobService();
    // JobService is already imported as an object, use it directly
  // Tab state
    let activeTab = $state<'timesheets' | 'internal-jobs'>('timesheets');
    // Fetch timesheets based on status
    async function fetchTimesheets() {
        isTimesheetsLoading = true;
        try {
            const response = await JobService.getWeeklyTimesheets(currentPage, pageSize, selectedStatus);
            if (response.success && response.data) {
                timesheets = response.data.weeklyTimesheets || [];
                totalCount = response.data.totalCount || 0;
                totalPages = Math.ceil(totalCount / pageSize);
                filterTimesheets();
            }
        } catch (error) {
            console.error('Error fetching timesheets:', error);
            timesheets = [];
            filteredTimesheets = [];
        } finally {
            isTimesheetsLoading = false;
        }
    }

        // Add internal jobs fetch function
    async function fetchInternalJobs() {
        try {
            internalJobsLoadingState = true;
            // Use getAllInternalJobs for the all approvals context (fetches ALL jobs across all clients)
            await jobActions.getAllInternalJobs(internalJobsCurrentPage, 10, internalJobsSearchQuery);
        } catch (error) {
            console.error('Error fetching all internal jobs:', error);
        } finally {
            internalJobsLoadingState = false;
        }
    }

    // Subscribe to store updates
    $effect(() => {
        internalJobsData = $internalJobs;
        internalJobsLoadingState = $isInternalJobsLoading;
        const pagination = $internalJobsPagination;
        internalJobsCurrentPage = pagination.currentPage;
        internalJobsTotalPages = pagination.totalPages;
        internalJobsTotalCount = pagination.totalCount;
    });

    // Handle internal jobs search
    function handleInternalJobsSearch() {
        internalJobsCurrentPage = 1;
        fetchInternalJobs();
    }

    // Handle internal jobs pagination
    function goToInternalJobsPage(page: number) {
        if (page >= 1 && page <= internalJobsTotalPages) {
            internalJobsCurrentPage = page;
            fetchInternalJobs();
        }
    }

    // Filter timesheets based on search query
    function filterTimesheets() {
        filteredTimesheets = timesheets.filter(timesheet => {
            const candidateName = `${timesheet.candidateFirstName} ${timesheet.candidateLastName}`.trim();
            const matchesSearch = !timesheetSearchQuery || 
                candidateName.toLowerCase().includes(timesheetSearchQuery.toLowerCase()) ||
                (timesheet.jobTitle && timesheet.jobTitle.toLowerCase().includes(timesheetSearchQuery.toLowerCase())) ||
                (timesheet.companyName && timesheet.companyName.toLowerCase().includes(timesheetSearchQuery.toLowerCase()));
            
            return matchesSearch;
        });
    }

    // Handle status change
    function handleStatusChange() {
        currentPage = 1; // Reset to first page when changing status
        fetchTimesheets();
    }

    // Handle page navigation
    function goToPage(page: number) {
        currentPage = Math.min(Math.max(1, page), totalPages);
        fetchTimesheets();
    }

    // Handle view details
    // Update the handleViewDetails function
    function handleViewDetails(timesheet: WeeklyTimesheetAPI) {
        selectedTimesheet = timesheet;
        showTimesheetDetailsDialog = true;
    }

    // React to search query changes
    $effect(() => {
        filterTimesheets();
    });

    // React to status changes
    $effect(() => {
        handleStatusChange();
    });

        let selectedClient = $state<ClientsType | null>(null);
    let showClientDropdown = $state(false);
    let clientSearchQuery = $state('');
    let filteredClients = $state<ClientsType[]>([]);
    
    // Add dialog state for internal job
    let showAddInternalJobDialog = $state(false);
    let isInternalEditMode = $state(false);
    let selectedInternalJob = $state<InternalJobAPI | null>(null);

  // Filter clients based on search
    $effect(() => {
        if (clientSearchQuery.trim() === '') {
            filteredClients = $clients.slice(0, 10); // Show first 10 clients
        } else {
            filteredClients = $clients.filter(client => 
                client.companyName.toLowerCase().includes(clientSearchQuery.toLowerCase())
            ).slice(0, 10);
        }
    });
    
    // Handle client selection
    function selectClient(client: ClientsType) {
        selectedClient = client;
        showClientDropdown = false;
        clientSearchQuery = client.companyName;
        // Refresh internal jobs for selected client
        if (activeTab === 'internal-jobs') {
            fetchInternalJobs();
        }
    }
    
    // Handle add internal job
    // Remove client selection requirement for internal jobs in this context
    // Since we're fetching ALL internal jobs, we don't need a specific client selected
    function handleAddInternalJob() {
        // In the "All Approvals" context, we still need to select a client for creating new jobs
        if (!selectedClient) {
            alert('Please select a client to add an internal job');
            return;
        }
        isInternalEditMode = false;
        selectedInternalJob = null;
        showAddInternalJobDialog = true;
    }
    
    // Handle edit internal job
    function handleEditInternalJob(job: InternalJobAPI) {
        selectedInternalJob = job;
        isInternalEditMode = true;
        showAddInternalJobDialog = true;
    }
    
    // Handle view internal job details
    function handleViewInternalJobDetails(job: InternalJobAPI) {
        // Implement view details functionality
        console.log('View job details:', job);
    }
    
    // Handle delete internal job
    async function handleDeleteInternalJob(jobId: string, clientId: string) {
        if (confirm('Are you sure you want to delete this internal job?')) {
            try {
                await jobActions.deleteInternalJob(jobId, clientId);
                fetchInternalJobs(); // Refresh the list
            } catch (error) {
                console.error('Error deleting internal job:', error);
            }
        }
    }
    
    // Handle internal job dialog events
    function handleInternalJobAdded() {
        fetchInternalJobs(); // Refresh the list
    }
    

    onMount(() => {
        fetchTimesheets();
        fetchInternalJobs();
        clientActions.fetchClients(); 
    });
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
                class="{activeTab === 'timesheets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                on:click={() => activeTab = 'timesheets'}
            >
                Timesheets Approval
            </button>
            <button
                class="{activeTab === 'internal-jobs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                on:click={() => activeTab = 'internal-jobs'}
            >
                Internal Jobs
            </button>
        </nav>
    </div>

    <!-- Timesheets Tab Content -->
    {#if activeTab === 'timesheets'}
      <div class="space-y-6">
    <!-- Fixed header section -->
    <div class="sticky top-0 bg-white z-20 pt-5">
        <div class="flex justify-between items-center mb-8 px-5">
            <h2 class="text-2xl font-bold text-gray-800">All Timesheets</h2>
            <!-- Add Create Weekly Timesheet button -->
            <button 
                class="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 transform scale-100 shadow-md hover:bg-blue-600"
                on:click={(e) => { e.stopPropagation(); showWeeklyTimesheetDialog = true; }}
            >
                <span class="material-icons-sharp">schedule</span>
                <span>Create Weekly Timesheet</span>
            </button>
        </div>

        <!-- Search and Filter Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm mt-4 mb-4">
            <div class="flex gap-4 items-center">
                <!-- Search Bar -->
                <div class="flex-1 relative">
                    <span class="material-icons-sharp absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                    <input 
                        type="text"
                        bind:value={timesheetSearchQuery}
                        placeholder="Search by candidate name, job title, or company..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                </div>
                
                <!-- Status Toggle -->
                <div class="min-w-[150px]">
                    <select
                        bind:value={selectedStatus}
                        class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="client-requested">Client Requested</option>
                    </select>
                </div>
            </div>
        </div>
        
        <!-- Fixed table header -->
        <div class="bg-gray-50 border-b border-gray-200">
            <div class="grid grid-cols-12 w-full min-w-[1200px]">
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Candidate</div>
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Job Title</div>
                <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Company</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Week Start</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Total Hours</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Status</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Created Date</div>
                <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Actions</div>
            </div>
        </div>
    </div>
    
    <!-- Scrollable content section -->
    <div class="overflow-auto max-h-[calc(100vh-400px)]">
        {#if isTimesheetsLoading}
            <div class="flex flex-col items-center justify-center py-20">
                <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <p class="mt-4 text-gray-600">Loading timesheets...</p>
            </div>
        {:else if filteredTimesheets.length === 0}
            <div class="flex flex-col items-center justify-center py-20">
                <span class="material-icons-sharp text-gray-400 text-5xl mb-4">schedule</span>
                <p class="text-gray-600">No timesheets found</p>
            </div>
        {:else}
            {#each filteredTimesheets as timesheet, i}
                <div 
                    class="grid grid-cols-12 w-full border-t border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer min-w-[1200px]"
                    in:fly|local={{ y: 20, duration: 300, delay: i * 50 }}
                >
                    <div class="p-6 col-span-2 flex items-center justify-start">
                        <div class="flex items-center">
                            <span class="material-icons-sharp text-purple-400 mr-2">person</span>
                            <span class="font-medium text-gray-800 truncate max-w-[200px]">
                                {`${timesheet.candidateFirstName} ${timesheet.candidateLastName}`.trim() || 'Unknown Candidate'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="p-6 col-span-2 flex items-center justify-start">
                        <span class="text-gray-600">{timesheet.jobTitle || 'Unknown Job'}</span>
                    </div>
                    
                    <div class="p-6 col-span-2 flex items-center justify-start">
                        <span class="text-gray-600">{timesheet.companyName || 'Unknown Company'}</span>
                    </div>
                    
                    <div class="p-6 col-span-1 flex items-center justify-center">
                        <span class="text-gray-600">{new Date(timesheet.weekStartDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div class="p-6 col-span-1 flex items-center justify-center">
                        <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            {(
                                (timesheet.monday?.totalHours || 0) +
                                (timesheet.tuesday?.totalHours || 0) +
                                (timesheet.wednesday?.totalHours || 0) +
                                (timesheet.thursday?.totalHours || 0) +
                                (timesheet.friday?.totalHours || 0) +
                                (timesheet.saturday?.totalHours || 0) +
                                (timesheet.sunday?.totalHours || 0)
                            ).toFixed(1)}h
                        </span>
                    </div>
                    
                    <div class="p-6 col-span-1 flex items-center justify-center">
                        <span class="px-3 py-1 rounded-full text-sm font-medium {
                            timesheet.weeklyStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }">
                            {timesheet.weeklyStatus === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                    </div>
                    
                    <div class="p-6 col-span-1 flex items-center justify-center">
                        <span class="text-gray-600">
                            {timesheet.monday?.createdAt ? new Date(timesheet.monday.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                    
                    <div class="p-6 col-span-2 flex items-center justify-center">
                        <div class="flex items-center gap-2">
                            <button 
                                class="p-2 hover:bg-blue-100 rounded-full transition-colors"
                                title="View Details"
                                on:click={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(timesheet);
                                }}
                            >
                                <span class="material-icons-sharp text-blue-600">visibility</span>
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 0}
        <div class="flex items-center justify-between px-6 py-4 border-t">
            <div class="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
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
                        class="min-w-[32px] h-8 rounded-lg transition-colors {currentPage === i + 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}"
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

{#if activeTab === 'internal-jobs'}
        <div class="p-6">
            <!-- Client Selection and Controls -->
            <div class="mb-6">
                <!-- Top Row: Client Selection, Add Job Button, and Search -->
                <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-end mb-4">
                             <!-- Search Internal Jobs -->
                    <div class="flex-1 min-w-0">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Search Jobs</label>
                        <div class="relative">
                            <input
                                type="text"
                                placeholder="Search internal jobs..."
                                bind:value={internalJobsSearchQuery}
                                on:input={handleInternalJobsSearch}
                                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <!-- Client Selection Dropdown -->
                    <div class="flex-1 min-w-0">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                        <div class="relative">
                            <input
                                type="text"
                                placeholder="Search and select a client..."
                                bind:value={clientSearchQuery}
                                on:focus={() => showClientDropdown = true}
                                on:input={() => showClientDropdown = true}
                                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            
                            <!-- Dropdown -->
                            {#if showClientDropdown && filteredClients.length > 0}
                                <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {#each filteredClients as client}
                                        <button
                                            type="button"
                                            class="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                                            on:click={() => selectClient(client)}
                                        >
                                            <div class="font-medium text-gray-900">{client.companyName}</div>
                                            <div class="text-sm text-gray-500">{client.email}</div>
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Add Internal Job Button -->
                    <div class="flex-shrink-0">
                        <label class="block text-sm font-medium text-gray-700 mb-2 lg:invisible">Action</label>
                        <button
                            type="button"
                            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            on:click={handleAddInternalJob}
                            disabled={!selectedClient}
                        >
                            <span class="material-icons-sharp mr-2">add</span>
                            Add Internal Job
                        </button>
                    </div>
                    
           
                </div>
                
                <!-- Selected Client Info -->
                {#if selectedClient}
                    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div class="flex items-center">
                            <span class="material-icons-sharp text-blue-600 mr-2">business</span>
                            <div>
                                <div class="font-medium text-blue-900">{selectedClient.companyName}</div>
                                <div class="text-sm text-blue-700">{selectedClient.email}</div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            
 

            <!-- Internal Jobs Table -->
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Type</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#if internalJobsLoadingState}
                            <tr>
                                <td colspan="8" class="px-6 py-4 text-center">
                                    <div class="flex justify-center items-center">
                                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span class="ml-2 text-gray-600">Loading internal jobs...</span>
                                    </div>
                                </td>
                            </tr>
                        {:else if internalJobsData.length === 0}
                            <tr>
                                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                                    {selectedClient ? 'No internal jobs found for this client' : 'Please select a client to view internal jobs'}
                                </td>
                            </tr>
                        {:else}
                            {#each internalJobsData as job}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {job.jobTitle}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.companyName || 'N/A'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.jobLocation}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.jobType}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {job.paymentType}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                            {job.status === 'active' ? 'bg-green-100 text-green-800' : 
                                             job.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                                             'bg-yellow-100 text-yellow-800'}">
                                            {job.status}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div class="flex items-center gap-1 pr-2">
                                            <button 
                                                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                title="Edit Job"
                                                on:click={() => handleEditInternalJob(job)}
                                            >
                                                <span class="material-icons-sharp text-gray-600">edit</span>
                                            </button>
                                            <button 
                                                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                title="View Details"
                                                on:click={() => handleViewInternalJobDetails(job)}
                                            >
                                                <span class="material-icons-sharp text-gray-600">visibility</span>
                                            </button>
                                            <button 
                                                class="p-2 hover:bg-red-100 rounded-full transition-colors"
                                                title="Delete Job"
                                                on:click={() => handleDeleteInternalJob(job.id, job.clientId)}
                                            >
                                                <span class="material-icons-sharp text-red-600">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
            <!-- Internal Jobs Pagination -->
             <div class="mt-6 flex items-center justify-between">
                    <div class="text-sm text-gray-700">
                        Showing {((internalJobsCurrentPage - 1) * 10) + 1} to {Math.min(internalJobsCurrentPage * 10, internalJobsTotalCount)} of {internalJobsTotalCount} results
                    </div>
                    <div class="flex space-x-2">
                        <button
                            on:click={() => goToInternalJobsPage(internalJobsCurrentPage - 1)}
                            disabled={internalJobsCurrentPage === 1}
                            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        {#each Array.from({length: Math.min(5, internalJobsTotalPages)}, (_, i) => {
                            const startPage = Math.max(1, internalJobsCurrentPage - 2);
                            return startPage + i;
                        }) as page}
                            {#if page <= internalJobsTotalPages}
                                <button
                                    on:click={() => goToInternalJobsPage(page)}
                                    class="px-3 py-2 text-sm font-medium {page === internalJobsCurrentPage ? 'text-blue-600 bg-blue-500 border-blue-500' : 'text-gray-500 bg-white border-gray-300'} border rounded-md hover:bg-gray-50"
                                >
                                    {page}
                                </button>
                            {/if}
                        {/each}
                        
                        <button
                            on:click={() => goToInternalJobsPage(internalJobsCurrentPage + 1)}
                            disabled={internalJobsCurrentPage === internalJobsTotalPages}
                            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
        </div>
    {/if}
</div>





<!-- Add the TimesheetDetailsDialog component at the end, before the closing div -->
<TimesheetDetailsDialog 
    bind:isOpen={showTimesheetDetailsDialog}
    timesheet={selectedTimesheet}
    on:close={() => {
        showTimesheetDetailsDialog = false;
        selectedTimesheet = null;
    }}
    on:timesheetUpdated={fetchTimesheets}
/>

<!-- Add WeeklyTimesheetDialog component -->
{#if showWeeklyTimesheetDialog}
    <WeeklyTimesheetDialog 
        bind:isOpen={showWeeklyTimesheetDialog}
        clientId={selectedClient?.id || ''}
        on:close={() => {
            showWeeklyTimesheetDialog = false;
        }}
        on:timesheetCreated={fetchTimesheets}
    />
{/if}

<AddInternalJobDialog 
    bind:showDialog={showAddInternalJobDialog}
    on:addInternalJob={handleInternalJobAdded}
    clientId={selectedClient?.id || ''}
    on:close={() => {
        showAddInternalJobDialog = false;
        isInternalEditMode = false;
    }}
    isEditMode={isInternalEditMode}
    jobToEdit={selectedInternalJob}
/>
