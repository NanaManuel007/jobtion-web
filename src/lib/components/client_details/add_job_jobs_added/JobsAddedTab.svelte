<script lang="ts">
  import { fly } from 'svelte/transition';
    import AddJobDialog from './AddJobDialog.svelte';
    import type { ClientsType,SelectedClientType } from '$lib/services/client_services/client.type';
    import type { JobData, JobResponse, PermanentJobAPI, InternalJobAPI } from '$lib/services/job_services/job.type';
    // Update to use permanent jobs with pagination
    import { permanentJobs, jobActions, isPermanentJobsLoading, permanentJobsPagination, internalJobs, isInternalJobsLoading, internalJobsPagination } from '$lib/services/job_services/job.store';
    import JobDetailsDialog from './JobDetailsDialog.svelte';
	import AddInternalJobDialog from './AddInternalJobDialog.svelte';
	import { string } from 'zod';
	import WeeklyTimesheetDialog from './WeeklyTimesheetDialog.svelte';
        import TimesheetDetailsDialog from './TimesheetDetailsDialog.svelte';
    import type { WeeklyTimesheetAPI, WeeklyTimesheetsResponse } from '$lib/services/job_services/job.type';
	import { JobService } from '$lib/services/job_services/job.services';
    import DeleteConfirmationDialog from '$lib/components/general_components/DeleteConfirmationDialog.svelte';
    // Add client charges import
    import { clientCharges, chargesLoading, clientActions } from '$lib/services/client_services/client.store';
    let showJobDetailsDialog = $state(false);
    const {client} = $props<{client:SelectedClientType}>();
    let hasInitialLoad = $state(false);
    let activeTab = $state('jobs-added');
let showWeeklyTimesheetDialog = $state(false);

        let showAddInternalJobDialog = $state(false);
    let isInternalEditMode = $state(false);
    let selectedInternalJob = $state<InternalJobAPI | null>(null);
   
        

            // Timesheet management variables
    let timesheets: WeeklyTimesheetAPI[] = [];
let filteredTimesheets: WeeklyTimesheetAPI[] = $state([]);
    let isTimesheetsLoading = $state(false);
    let timesheetSearchQuery = '';
    let selectedTimesheetStatus: 'pending' | 'completed' = 'pending';
    let timesheetPagination = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
    };
    let showTimesheetDetailsDialog = $state(false);
    let selectedTimesheet: WeeklyTimesheetAPI | null = $state(null);

        // Timesheet management functions
    async function loadTimesheets() {
        isTimesheetsLoading = true;
        try {
            const response: WeeklyTimesheetsResponse = await JobService.getWeeklyTimesheets(
                timesheetPagination.currentPage,
                timesheetPagination.pageSize,
                selectedTimesheetStatus === 'pending' ? 'pending' : selectedTimesheetStatus
            );
            
            if (response.success) {
                console.log('Full response.data:', response.data); // Debug log
                timesheets = response.data.weeklyTimesheets; // Changed from timesheets to weeklyTimesheets
                //print what is in response.data lets see the data 

                 console.log('Full times',timesheets); 
                timesheetPagination = {
                    currentPage: response.data.currentPage || 1,
                    pageSize: response.data.pageSize || 10,
                    totalCount: response.data.weeklyTimesheets?.length || 0,
                    totalPages: Math.ceil((response.data.weeklyTimesheets?.length || 0) / 10)
                };
                filterTimesheets();
            }
        } catch (error) {
            console.error('Error loading timesheets:', error);
            timesheets = [];
        } finally {
            isTimesheetsLoading = false;
        }
    }
    
    // function getWeeklyStatus(timesheet: any): string {
    //     const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    //     const dayStatuses = days
    //         .map(day => timesheet[day]?.status)
    //         .filter(status => status); // Remove null/undefined
        
    //     if (dayStatuses.length === 0) return 'pending';
    //     if (dayStatuses.every(status => status === 'approved')) return 'completed';
    //     if (dayStatuses.some(status => status === 'rejected')) return 'rejected';
    //     return 'pending';
    // }
    
    function filterTimesheets() {
        if (!Array.isArray(timesheets)) {
            timesheets = [];
        }
        
        filteredTimesheets = timesheets.filter(timesheet => {
            const candidateName = `${timesheet.candidateFirstName} ${timesheet.candidateLastName}`.trim();
            const matchesSearch = !timesheetSearchQuery || 
                candidateName.toLowerCase().includes(timesheetSearchQuery.toLowerCase()) ||
                (timesheet.jobTitle && timesheet.jobTitle.toLowerCase().includes(timesheetSearchQuery.toLowerCase()));
            
            // Remove the status filter to show all timesheets
            const matchesStatus = true;
            
            return matchesSearch && matchesStatus;
        });
        console.log('Filtered timesheets:', filteredTimesheets);
    }
    
    function handleTimesheetSearch() {
        filterTimesheets();
    }
    
    function handleStatusFilter() {
        timesheetPagination.currentPage = 1;
        loadTimesheets();
    }
    
    function refreshTimesheets() {
        loadTimesheets();
    }
    
    function goToTimesheetPage(page: number) {
        timesheetPagination.currentPage = page;
        loadTimesheets();
    }
    
    function handleTimesheetClick(timesheet: WeeklyTimesheetAPI) {
        selectedTimesheet = timesheet;
        showTimesheetDetailsDialog = true;
    }
    
    function calculateTimesheetHours(timesheet: WeeklyTimesheetAPI): number {
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        return daysOfWeek.reduce((total, day) => {
            const dayData = timesheet[day as keyof WeeklyTimesheetAPI] as any;
            if (dayData && dayData.start && dayData.finish) {
                const startTime = new Date(`2000-01-01T${dayData.start}:00`);
                const finishTime = new Date(`2000-01-01T${dayData.finish}:00`);
                const breakMinutes = dayData.break ? parseInt(dayData.break.split(':')[0]) * 60 + parseInt(dayData.break.split(':')[1]) : 0;
                
                const totalMinutes = (finishTime.getTime() - startTime.getTime()) / (1000 * 60) - breakMinutes;
                return total + Math.max(0, totalMinutes / 60);
            }
            return total;
        }, 0);
    }
    
// async function handleQuickApprove(timesheet: WeeklyTimesheetAPI, event: Event) {
//     event.stopPropagation();
//     try {
//         await JobService.updateWeeklyTimesheetStatus(
//             timesheet.jobId,
//             timesheet.candidateId,
//             timesheet.id,
//             'completed'
//         );
//         console.log('Timesheet approved successfully');
//         await refreshTimesheets();
//     } catch (error) {
//         console.error('Error approving timesheet:', error);
//     }
// }

    
    async function handleQuickReject(timesheet: WeeklyTimesheetAPI) {
        // Implement quick reject logic
        console.log('Quick reject timesheet:', timesheet.id);
        // You would call an API endpoint here
        await refreshTimesheets();
    }
    
    function handleDownloadTimesheet(timesheet: WeeklyTimesheetAPI) {
        // Implement download logic
        console.log('Download timesheet:', timesheet.id);
    }
    
    // Load timesheets when timesheet tab becomes active
    $effect(() => {
        if (activeTab === 'timesheet') {
            loadTimesheets();
        }
    });
$effect(() => {
    if (!hasInitialLoad && activeTab === 'jobs-added') {
        // Initial load
        loadPermanentJobs(1, 10);
        hasInitialLoad = true;
    } else if (searchQuery !== undefined && activeTab === 'jobs-added') {
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
    
    // Add internal jobs state and functions
    let internalSearchQuery = $state('');
    let hasInternalInitialLoad = $state(false);
    
    $effect(() => {
        if (!hasInternalInitialLoad && activeTab === 'internal-jobs') {
            // Initial load for internal jobs
            loadInternalJobs(1, 10);
            hasInternalInitialLoad = true;
        } else if (internalSearchQuery !== undefined && activeTab === 'internal-jobs') {
            // Debounced search for internal jobs
            const timeoutId = setTimeout(() => {
                loadInternalJobs(1, 10, internalSearchQuery);
            }, 300);
            
            return () => clearTimeout(timeoutId);
        }
    });
    
    async function loadInternalJobs(page: number = 1, pageSize: number = 10, search?: string) {
        try {
            await jobActions.getInternalJobs(client.id.toString(),page, pageSize,  search);
        } catch (error) {
            console.error('Failed to load internal jobs:', error);
        }
    }
    
    async function goToInternalJobPage(page: number) {
        await loadInternalJobs(page, $internalJobsPagination.pageSize, internalSearchQuery);
        
        // Add scroll to top of table content
        const tableContent = document.querySelector('.overflow-auto');
        if (tableContent) {
            tableContent.scrollTop = 0;
        }
    }
    
    
    function handleEditInternalJob(job: InternalJobAPI) {
        selectedInternalJob = job;
        isInternalEditMode = true;
        showAddInternalJobDialog = true;
    }
    
    async function handleAddInternalJob(event: CustomEvent<{jobData: any}>) {
        try {
            await loadInternalJobs();
            showAddInternalJobDialog = false;
            isInternalEditMode = false;
        } catch (error) {
            console.error('Error adding internal job:', error);
        }
    }
    
    async function handleDeleteInternalJob(jobId: string,clientId:string) {
        if (confirm('Are you sure you want to delete this internal job?')) {
            try {
                await jobActions.deleteInternalJob(jobId,clientId);
                await loadInternalJobs($internalJobsPagination.currentPage, $internalJobsPagination.pageSize, internalSearchQuery);
            } catch (error) {
                console.error('Failed to delete internal job:', error);
            }
        }
    }

    //     function getWeeklyStatus(timesheet: WeeklyTimesheetAPI): string {
    //     const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    //     const dayStatuses = daysOfWeek
    //         .map(day => timesheet[day as keyof WeeklyTimesheetAPI])
    //         .filter(dayData => dayData !== null)
    //         .map(dayData => (dayData as any)?.status)
    //         .filter(status => status);
        
    //     if (dayStatuses.length === 0) return 'pending';
        
    //     // If all days are approved, weekly status is completed
    //     if (dayStatuses.every(status => status === 'approved')) return 'completed';
        
    //     // If any day is rejected, weekly status is rejected
    //     if (dayStatuses.some(status => status === 'rejected')) return 'rejected';
        
    //     // Otherwise, it's pending
    //     return 'pending';
    
    // }
// Add these variables after the existing timesheet variables
let showTimesheetEditDialog = $state(false);
let selectedTimesheetForEdit: WeeklyTimesheetAPI | null = null;

// Add toast notification variables
let showToast = $state(false);
let toastMessage = $state('');
let toastType: 'success' | 'error' | 'info' = $state('info');

// Add delete dialog variables
let showDeleteDialog = $state(false);
let timesheetToDelete: any = $state(null);
let isDeletingTimesheet = $state(false);

// Add validation state
let chargesValidationError = $state('');

// Add these functions after the existing timesheet functions
async function handleViewDetails(timesheet: WeeklyTimesheetAPI) {
    selectedTimesheet = timesheet;
    showTimesheetDetailsDialog = true;
}

async function handleQuickApprove(timesheet: WeeklyTimesheetAPI, event: Event) {
    event.stopPropagation();
    try {
        await JobService.updateWeeklyTimesheetStatus(
            timesheet.jobId,
            timesheet.candidateId,
            timesheet.id,
            'completed'
        );
        console.log('Timesheet approved successfully');
        await refreshTimesheets();
    } catch (error) {
        console.error('Error approving timesheet:', error);
    }
}

async function handleEditTimesheet(timesheet: WeeklyTimesheetAPI, event: Event) {
    event.stopPropagation();
    selectedTimesheetForEdit = timesheet;
    showTimesheetEditDialog = true;
}

// Add toast notification variables
// let showToast = $state(false);
// let toastMessage = $state('');
// let toastType: 'success' | 'error' | 'info' = $state('info');

// Add toast helper functions
function showSuccessToast(message: string) {
    toastMessage = message;
    toastType = 'success';
    showToast = true;
    setTimeout(() => showToast = false, 3000);
}

function showErrorToast(message: string) {
    toastMessage = message;
    toastType = 'error';
    showToast = true;
    setTimeout(() => showToast = false, 3000);
}

// Add delete confirmation functions
async function handleDeleteConfirm() {
    if (!timesheetToDelete) return;
    
    isDeletingTimesheet = true;
    
    try {
        const jobId = timesheetToDelete.jobId || timesheetToDelete.internalJobId;
        const userId = timesheetToDelete.candidateId || timesheetToDelete.userId;
        
        if (!jobId || !userId) {
            throw new Error('Missing required IDs for deletion');
        }
        
        await JobService.deleteWeeklyTimesheet(jobId, userId, timesheetToDelete.id);
        
        showSuccessToast('Timesheet deleted successfully');
        await refreshTimesheets();
        
        // Close dialog
        showDeleteDialog = false;
        timesheetToDelete = null;
    } catch (error) {
        console.error('Error deleting timesheet:', error);
        showErrorToast('Failed to delete timesheet');
    } finally {
        isDeletingTimesheet = false;
    }
}

function handleDeleteCancel() {
    showDeleteDialog = false;
    timesheetToDelete = null;
}

// Add function to validate client charges
async function validateClientCharges(): Promise<boolean> {
    try {
        // Load client charges if not already loaded
        if (!$clientCharges) {
            await clientActions.getClientCharges(client.id);
        }
        
        // Check if charges are available and valid
        if (!$clientCharges?.data) {
            chargesValidationError = 'Client charges information is not available. Please configure client charges before adding jobs.';
            return false;
        }
        
        const charges = $clientCharges.data;
        
        // Check if current charges are set and greater than 0
        if (!charges.currentCharges || charges.currentCharges <= 0) {
            chargesValidationError = 'Client charges must be configured with a valid amount greater than 0 before adding jobs.';
            return false;
        }
        
        chargesValidationError = '';
        return true;
    } catch (error) {
        console.error('Error validating client charges:', error);
        chargesValidationError = 'Failed to validate client charges. Please try again.';
        return false;
    }
}

// Update the Add Internal Job handler
async function handleAddInternalJobClick() {
    const isValid = await validateClientCharges();
    
    if (!isValid) {
        // Show error toast or alert
        showErrorToast(chargesValidationError);
        return;
    }
    
    // If validation passes, show the dialog
    showAddInternalJobDialog = true;
}

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
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Job Management</h2>
        
        <!-- Tabs -->
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                <button
                    class="{activeTab === 'jobs-added' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'jobs-added'}
                >
                    Jobs Added
                </button>
                <button
                    class="{activeTab === 'internal-jobs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'internal-jobs'}
                >
                    Internal Job Creations
                </button>
                <button
                    class="{activeTab === 'timesheet' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'timesheet'}
                >
                    Weekly Timesheet Creations
                </button>
            </nav>
        </div>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'jobs-added'}
        <div in:fly={{ x: 100, duration: 300 }}>
            <!-- Fixed header section -->
            <div class="sticky top-0 bg-white z-20 pt-5">
                <div class="flex justify-between items-center mb-8 px-5">
                    <h3 class="text-xl font-semibold text-gray-800">Jobs Added</h3>
                 <button 
                        class="bg-gray-500 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 transform scale-100 shadow-md hover:bg-gray-600"
                         onclick={(e) => { e.stopPropagation(); showAddJobDialog = true; }}
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
                            <span class=" px-3 rounded-full text-sm font-medium text-center items-center justify-center {job.isPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                {job.isPublished ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class=" py-6 items-center justify-items-center col-span-1">
                            <button 
                                class="text-gray-500 font-medium flex items-center gap-1 hover:text-gray-700 justify-items-center"
                                onclick={() => handleManageCandidates(job)}
                            >
                                <span class="material-icons-sharp text-sm">person_add</span>
                            </button>
                        </div>
                        <div class="p-6 text-gray-600 col-span-2 text-center">{job.timeOfPostingJob?.split('T')[0] || 'N/A'}</div>
                        <div class="p-6 text-gray-600 col-span-1 text-center">
                            <!-- Dynamic publish status indicator -->
                            <span class="inline-block w-4 h-4 transform rounded-full {job.isPublished ? 'bg-green-500' : 'bg-red-500'}"></span>
                        </div>

                        <div class="p-6 col-span-1 pl-2 pr-2">
                            <div class="flex items-center gap-1 pr-2">
                                <button 
                                    class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    onclick={() => handleEditJob(job)}
                                >
                                    <span class="material-icons-sharp text-gray-600">edit</span>
                                </button>
                                <button class="p-2 hover:bg-gray-100 rounded-full transition-colors" onclick={() => handleViewJobDetails(job)}>
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
            
            <!-- Pagination -->
            {#if $permanentJobsPagination.totalPages > 0}
                <div class="flex items-center justify-between px-6 py-4 border-t">
                    <div class="text-sm text-gray-600">
                        Showing {($permanentJobsPagination.currentPage - 1) * $permanentJobsPagination.pageSize + 1} to {Math.min($permanentJobsPagination.currentPage * $permanentJobsPagination.pageSize, $permanentJobsPagination.totalCount)} of {$permanentJobsPagination.totalCount} entries
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={$permanentJobsPagination.currentPage === 1}
                            onclick={() => goToPage($permanentJobsPagination.currentPage - 1)}
                        >
                            <span class="material-icons-sharp">chevron_left</span>
                        </button>
                        
                        {#each Array($permanentJobsPagination.totalPages) as _, i}
                            <button 
                                class={`min-w-[32px] h-8 rounded-lg transition-colors ${$permanentJobsPagination.currentPage === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                onclick={() => goToPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        {/each}
                        
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={$permanentJobsPagination.currentPage === $permanentJobsPagination.totalPages}
                            onclick={() => goToPage($permanentJobsPagination.currentPage + 1)}
                        >
                            <span class="material-icons-sharp">chevron_right</span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    {#if activeTab === 'internal-jobs'}
        <div in:fly={{ x: 100, duration: 300 }}>
            <!-- Fixed header section -->
            <div class="sticky top-0 bg-white z-20 pt-5">
                <div class="flex justify-between items-center mb-8 px-5">
                    <h3 class="text-xl font-semibold text-gray-800">Internal Jobs</h3>
                    <button 
                        class="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 transform scale-100 shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onclick={handleAddInternalJobClick}
                        disabled={$chargesLoading}
                    >
                        <span class="material-icons-sharp">add_circle</span>
                        <span>{$chargesLoading ? 'Checking charges...' : 'Add Internal Job'}</span>
                    </button>
                </div>

                <div class="bg-white p-6 rounded-2xl shadow-sm mt-4 mb-4">
                    <div class="flex gap-4 items-center">
                        <div class="flex-1 relative">
                            <span class="material-icons-sharp absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                            <input 
                                type="text"
                                bind:value={internalSearchQuery}
                                placeholder="Search internal jobs by company name..."
                                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                    </div>
                </div>
                
                <!-- Fixed table header -->
                <div class="bg-gray-50 border-b border-gray-200">
                    <div class="grid grid-cols-12 w-full min-w-[1200px]">
                        <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Job Title</div>
                        <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Company</div>
                        <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Location</div>
                        <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Roles Available</div>
                        <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Created Date</div>
                        <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Status</div>
                        <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Actions</div>
                    </div>
                </div>
            </div>
            
            <!-- Scrollable content section -->
            <div class="overflow-auto max-h-[calc(100vh-400px)]">
                {#if $isInternalJobsLoading}
                    <div class="flex flex-col items-center justify-center py-20">
                        <div class="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        <p class="mt-4 text-gray-600">Loading internal jobs...</p>
                    </div>
                {:else if $internalJobs.length === 0}
                    <div class="flex flex-col items-center justify-center py-20">
                        <span class="material-icons-sharp text-gray-400 text-5xl mb-4">business_center</span>
                        <p class="text-gray-600">No internal jobs found</p>
                    </div>
                {:else}
                    {#each $internalJobs as job, i}
                        <div 
                            class="grid grid-cols-12 w-full border-t border-gray-100 transition-colors hover:bg-gray-50"
                            in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
                        >
                            <div class="p-6 col-span-2 items-center justify-start flex">
                                <div class="flex items-center">
                                    <span class="material-icons-sharp text-blue-400 mr-2">business_center</span>
                                    <span class="font-medium text-gray-800 truncate max-w-[200px]" title="{job.jobTitle}">{job.jobTitle}</span>
                                </div>
                            </div>
                            <div class="p-6 text-gray-600 flex col-span-2 justify-start items-start">{job.companyName}</div>
                            <div class="p-6 text-gray-600 flex col-span-2 justify-start items-start">{job.jobLocation}</div>
                            <div class="p-6 col-span-1 text-center">
                                <span class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                    {job.numberOfRolesAvailable}
                                </span>
                            </div>
                            <div class="p-6 text-gray-600 col-span-2 text-center">{job.createdAt?.split('T')[0] || 'N/A'}</div>
                            <div class="p-6 col-span-1 text-center">
                                <span class="px-3 py-1 rounded-full text-sm font-medium {job.isCreatedByAdmin ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                    {job.isCreatedByAdmin ? 'Admin Created' : 'Client Created'}
                                </span>
                            </div>
                            <div class="p-6 col-span-2 pl-2 pr-2">
                                <div class="flex items-center gap-1 pr-2">
                                    <button 
                                        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        onclick={() => handleEditInternalJob(job)}
                                    >
                                        <span class="material-icons-sharp text-gray-600">edit</span>
                                    </button>
                                    <button 
                                        class="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                                        onclick={() => handleViewInternalJobDetails(job)}
                                    >
                                        <span class="material-icons-sharp text-gray-600">visibility</span>
                                    </button>
                                    <button 
                                        class="p-2 hover:bg-red-100 rounded-full transition-colors"
                                        onclick={() => handleDeleteInternalJob(job.id,job.clientId)}
                                    >
                                        <span class="material-icons-sharp text-red-600">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            
            <!-- Pagination for Internal Jobs -->
            {#if $internalJobsPagination.totalPages > 0}
                <div class="flex items-center justify-between px-6 py-4 border-t">
                    <div class="text-sm text-gray-600">
                        Showing {($internalJobsPagination.currentPage - 1) * $internalJobsPagination.pageSize + 1} to {Math.min($internalJobsPagination.currentPage * $internalJobsPagination.pageSize, $internalJobsPagination.totalCount)} of {$internalJobsPagination.totalCount} entries
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={$internalJobsPagination.currentPage === 1}
                            onclick={() => goToInternalJobPage($internalJobsPagination.currentPage - 1)}
                        >
                            <span class="material-icons-sharp">chevron_left</span>
                        </button>
                        
                        {#each Array($internalJobsPagination.totalPages) as _, i}
                            <button 
                                class={`min-w-[32px] h-8 rounded-lg transition-colors ${$internalJobsPagination.currentPage === i + 1 ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                                onclick={() => goToInternalJobPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        {/each}
                        
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={$internalJobsPagination.currentPage === $internalJobsPagination.totalPages}
                            onclick={() => goToInternalJobPage($internalJobsPagination.currentPage + 1)}
                        >
                            <span class="material-icons-sharp">chevron_right</span>
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
{#if activeTab === 'timesheet'}
    <div in:fly={{ x: 100, duration: 300 }}>
        <!-- Fixed header section -->
        <div class="sticky top-0 bg-white z-20 pt-5">
            <div class="flex justify-between items-center mb-8 px-5">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-semibold text-gray-800">Timesheet Management</h3>
                    <button 
                        class="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 transform scale-100 shadow-md hover:bg-blue-600"
                        onclick={(e) => { e.stopPropagation(); showWeeklyTimesheetDialog = true; }}
                    >
                        <span class="material-icons-sharp">schedule</span>
                        <span>Create Weekly Timesheet</span>
                    </button>
                </div>
            </div>
            
            <!-- Fixed table header -->
            <div class="bg-gray-50 border-b border-gray-200">
                <div class="grid grid-cols-12 w-full min-w-[1200px]">
                    <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Candidate</div>
                    <div class="p-6 text-start text-sm font-semibold text-gray-600 col-span-2">Job Title</div>
                    <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Week Start</div>
                    <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Total Hours</div>
                    <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-1">Status</div>
                    <div class="p-6 text-center text-sm font-semibold text-gray-600 col-span-2">Created Date</div>
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
                        
                        <div class="p-6 col-span-2 flex items-center justify-center">
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
                            <span class="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                                Pending
                            </span>
                        </div>
                        
                        <div class="p-6 col-span-2 flex items-center justify-center">
                            <span class="text-gray-600">
                                {timesheet.monday?.createdAt ? new Date(timesheet.monday.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        
                        <div class="p-6 col-span-2 flex items-center justify-center">
                            <div class="flex items-center gap-2">
                                <button 
                                    class="p-2 hover:bg-blue-100 rounded-full transition-colors"
                                    title="View Details"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetails(timesheet);
                                    }}
                                >
                                    <span class="material-icons-sharp text-blue-600">visibility</span>
                                </button>
                                
                                <button 
                                    class="p-2 hover:bg-red-100 rounded-full transition-colors"
                                    title="Delete Timesheet"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        timesheetToDelete = timesheet;
                                        showDeleteDialog = true;
                                    }}
                                >
                                    <span class="material-icons-sharp text-red-600">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<DeleteConfirmationDialog
    show={showDeleteDialog}
    title="Delete Timesheet"
    message={timesheetToDelete ? 
        `Are you sure you want to delete the timesheet for ${timesheetToDelete.candidateFirstName} ${timesheetToDelete.candidateLastName} on ${timesheetToDelete.jobTitle}? This action cannot be undone.` : 
        'Are you sure you want to delete this timesheet?'
    }
    itemName={timesheetToDelete ? `Week of ${new Date(timesheetToDelete.weekStartDate).toLocaleDateString()}` : ''}
    isLoading={isDeletingTimesheet}
    on:confirm={handleDeleteConfirm}
    on:cancel={handleDeleteCancel}
/>
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

<AddInternalJobDialog 
    bind:showDialog={showAddInternalJobDialog}
    on:addInternalJob={handleAddInternalJob}
    clientId={client.id}
    on:close={() => {
        showAddInternalJobDialog = false;
        isInternalEditMode = false;
    }}
    isEditMode={isInternalEditMode}
    jobToEdit={selectedInternalJob}
/>
<TimesheetDetailsDialog 
    bind:isOpen={showTimesheetDetailsDialog}
    timesheet={selectedTimesheet}
    on:close={() => {
        showTimesheetDetailsDialog = false;
        selectedTimesheet = null;
    }}
    on:timesheetUpdated={refreshTimesheets}
/>

{#if showTimesheetEditDialog && selectedTimesheetForEdit}
    <TimesheetDetailsDialog 
        bind:isOpen={showTimesheetEditDialog}
        timesheet={selectedTimesheetForEdit}
        on:close={() => {
            showTimesheetEditDialog = false;
            selectedTimesheetForEdit = null;
        }}
        on:timesheetUpdated={refreshTimesheets}
    />
{/if}

{#if showWeeklyTimesheetDialog}
    <WeeklyTimesheetDialog 
        bind:isOpen={showWeeklyTimesheetDialog}
        clientId={client.id}
        on:close={() => {
            showWeeklyTimesheetDialog = false;
        }}
        on:timesheetCreated={refreshTimesheets}
    />
{/if}
<!-- Toast notification -->
{#if showToast}
    <div class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 {
        toastType === 'success' ? 'bg-green-500 text-white' :
        toastType === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }">
        <div class="flex items-center gap-2">
            <span class="material-icons-sharp">
                {toastType === 'success' ? 'check_circle' : toastType === 'error' ? 'error' : 'info'}
            </span>
            <span>{toastMessage}</span>
        </div>
    </div>
{/if}
