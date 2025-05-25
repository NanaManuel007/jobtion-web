<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import SearchBar from '$lib/components/all_clients/SearchBar.svelte';
    import Dialog from '../general_components/Dialog.svelte';
    import Toast from '../general_components/Toast.svelte';
    import InterviewDialog from './InterviewDialog.svelte';
    import { applicationStore } from '$lib/services/application_services/application.stores';
    import type { Application } from '$lib/services/application_services/application.types';

    let mounted = $state(false);
    let searchTerm = $state('');
    let selectedCompany = $state('All Companies');
    let selectedStatus = $state('Interview');
    let showInterviewDialog = $state(false);
    let showRejectDialog = $state(false);
    let selectedApplication = $state<Application | null>(null);
        let acceptLoading = $state(false);
        let declineLoading = $state(false);
    // Pagination variables
    let currentPage = $state(1);
    const itemsPerPage = 8;
    let totalPages = $state(1);
    let paginatedApplications = $state<Application[]>([]);

    let statusOptions = $state(['All', 'Pending', 'Accepted', 'Interview', 'Rejected']);
    let companies = $state<string[]>(['All Companies']);
    // let applications = $state<Application[]>([]);

    // Subscribe to the application store
    let applications = $state($applicationStore.applications);

// Update applications when store changes
$effect(() => {
    applications = $applicationStore.applications;
});

// Update companies based on applications
$effect(() => {
    const uniqueCompanies = [...new Set(applications.map(app => app.company_name))];
    companies = ['All Companies', ...uniqueCompanies];
});

    function handleInterview(application: Application) {
        selectedApplication = application;
        showInterviewDialog = true;
    }
    function handleScheduleInterview(event: CustomEvent) {
    const interviewDetails = {
        interview_by: event.detail.interview_by,
        interview_date: event.detail.interview_date,
        interview_time: event.detail.interview_time,
        interview_invite_link: event.detail.interview_invite_link
    };
    
    if (selectedApplication) {
        const updatedApplications = applications.map(app => 
            app.id === selectedApplication?.id 
                ? {...app, 
                    status: 'Interview', 
                    interviewDetails: interviewDetails}
                : app
        );
        
        $applicationStore.applications = updatedApplications;
        
        showSuccessToast(`Interview ${interviewDetails.interview_date ? 'scheduled' : 'rescheduled'} for ${selectedApplication.first_name}`);
    }
    showInterviewDialog = false;
    selectedApplication = null;
}
    onMount(async () => {
        await applicationStore.fetchApplications();
        mounted = true;
    });


    $effect(() => {
    const filtered = applications.filter(app => {
        const matchesSearch = searchTerm === '' || Object.values(app).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesCompany = selectedCompany === 'All Companies' || app.company_name === selectedCompany;
        const matchesStatus = selectedStatus === 'All' || app.status.toLowerCase() === selectedStatus.toLowerCase();
        const matchesJobType = app.job_type === 'Permanent';
        
        return matchesSearch && matchesCompany && matchesStatus && matchesJobType;
    });

    totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    currentPage = Math.min(currentPage, totalPages);
    
    paginatedApplications = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
});
    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    function handleViewUser(userId: number) {
        goto(`/private/all_candidates/candidate_details/${userId}`);
    }

    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');

    function showSuccessToast(message: string) {
        toastMessage = message;
        toastType = 'success';
        showToast = true;
        setTimeout(() => showToast = false, 3000);
    }

    function confirmInterview() {
        if (selectedApplication) {
            selectedApplication.status = 'Interview';
            showSuccessToast(`Interview scheduled for ${selectedApplication.first_name + " "+ selectedApplication.last_name}`);
        }
        showInterviewDialog = false;
        selectedApplication = null;
    }
    async function confirmAccept() {
        let acceptLoading = $state(false);
        if (selectedApplication) {
            try {
                await applicationStore.acceptApplication(selectedApplication.id);
                console.log(selectedApplication.id)
                showSuccessToast(`Successfully accepted ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
                showRejectDialog = false;
                selectedApplication = null;
            } catch (error) {
                toastType = 'error';
                toastMessage = 'Failed to accept application';
                showToast = true;
            }
        }
    }
    function handleReject(application: Application) {
        selectedApplication = application;
        showRejectDialog = true;
    }

    async function confirmDecline() {
        declineLoading = true;
        if (selectedApplication) {
            try {
                console.log(selectedApplication.id)
                await applicationStore.declineApplication(selectedApplication.id);
                showSuccessToast(`Successfully declined ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
                showRejectDialog = false;
                selectedApplication = null;
             
            } catch (error) {
                toastType = 'error';
                toastMessage = 'Failed to decline application';
                showToast = true;
            }
        }
    }
</script>
{#if showInterviewDialog && selectedApplication}
    <Dialog
        show={showInterviewDialog}
        title="Schedule Interview"
        onClose={() => showInterviewDialog = false}
    >
        <p class="text-gray-600">
            Schedule interview with {selectedApplication?.first_name + " "+ selectedApplication?.last_name} for the {selectedApplication?.job_title} position at {selectedApplication?.company_name}?
        </p>
        
        <svelte:fragment slot="actions">
            <button
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                on:click={() => showInterviewDialog = false}
            >
                Cancel
            </button>
            <button
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                on:click={confirmInterview}
            >
                Schedule
            </button>
        </svelte:fragment>
    </Dialog>
{/if}

<Toast 
    show={showToast}
    message={toastMessage}
    type={toastType}
/>

<InterviewDialog
    show={showInterviewDialog}
    application={selectedApplication}
    on:scheduleInterview={handleScheduleInterview}
    on:close={() => showInterviewDialog = false}
/>

{#if showRejectDialog && selectedApplication}
    <Dialog
        show={showRejectDialog}
        title="Make A Decision"
        onClose={() => showRejectDialog = false}
    >
        <p class="text-gray-600">
            Make a decision for {selectedApplication?.first_name}'s application for {selectedApplication?.job_title}?
        </p>
        
        <svelte:fragment slot="actions">
            <button
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                on:click={() => showRejectDialog = false}
            >
                Cancel
            </button>
            <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            on:click={confirmAccept}
            disabled={acceptLoading}
        >
            {#if acceptLoading}
            <div class="flex items-center justify-center">
                <svg class={`animate-spin h-4 w-4 text-gray-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
            {:else}
                Accept
            {/if}
        </button>
        <button
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            on:click={confirmDecline}
            disabled={declineLoading}
        >
            {#if declineLoading}
            <svg class={`animate-spin h-4 w-4 text-gray-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {:else}
                Reject
            {/if}
        </button>
        </svelte:fragment>
    </Dialog>
{/if}

{#if mounted}
    <div class="pt-10 pr-10 pl-10">
        <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
            <section class="w-full overflow-hidden">
                <div class="w-full bg-white/25 p-6 flex items-center">
                    <h1 class="text-3xl font-semibold">Applications</h1>
                    <div class="flex-grow"></div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <label for="company-filter" class="text-sm font-medium text-gray-600">
                                Company:
                            </label>
                            <select
                                id="company-filter"
                                bind:value={selectedCompany}
                                class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                {#each companies as company}
                                    <option value={company}>{company}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="flex items-center gap-2">
                            <label for="status-filter" class="text-sm font-medium text-gray-600">
                                Status:
                            </label>
                            <select
                                id="status-filter"
                                bind:value={selectedStatus}
                                class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                {#each statusOptions as status}
                                    <option value={status}>{status}</option>
                                {/each}
                            </select>
                        </div>
                        <SearchBar bind:searchTerm />
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="text-left p-4 font-medium text-gray-600">User</th>
                                <th class="text-left p-4 font-medium text-gray-600">Company</th>
                                <th class="text-left p-4 font-medium text-gray-600">Job ID</th>
                                <th class="text-left p-4 font-medium text-gray-600">Job Title</th>
                                <th class="text-left p-4 font-medium text-gray-600">Job Type</th>
                                <th class="text-center p-4 font-medium text-gray-600">Posted Roles</th>
                                <th class="text-left p-4 font-medium text-gray-600">Status</th>
                                <th class="text-left p-4 font-medium text-gray-600">Applied Date</th>
                                <th class="text-center p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each paginatedApplications as application}
                                <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td class="p-4">
                                        <div class="space-y-2">
                                            <div class="flex items-center gap-3 ">
                                                <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                    {#if application.profile_picture}
                                                        <img 
                                                            src={application.profile_picture !==null ? "https://node.jobtiondevs.com/"+application.profile_picture : '/user_images/default.jpg'} 
                                                            alt={`Profile picture of ${application.first_name} ${application.last_name}`}
                                                            class="w-full h-full object-cover"
                                                        >
                                                    {:else}
                                                        <span class="material-icons-sharp text-gray-400 w-full h-full flex items-center justify-center">person</span>
                                                    {/if}
                                                </div>
                                                <span class="font-medium">{application.first_name} {application.last_name}</span>
                                            </div>
                                            <div class="pl-13">
                                                <button
                                                    class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                                    on:click={() => handleViewUser(application.id)}
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <span class="font-medium text-gray-700">{application.company_name}</span>
                                    </td>
                                    <td class="p-4">
                                        <span class="font-mono text-sm">{application.job_id}</span>
                                    </td>
                                    <td class="p-4">{application.job_title}</td>
                                    <td class="p-4">
                                        <span class="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                            {application.job_type}
                                        </span>
                                    </td>
                                    <td class="p-4 text-center">
                                        <span class="font-medium">{application.posted_roles}</span>
                                    </td>
                                    <td class="p-4">
                                        <span class={`px-2 py-1 rounded-full text-sm ${application.status === 'accepted' ? 'bg-green-100 text-green-800' : application.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {application.status}
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        {new Date(application.created_at).toLocaleDateString()}
                                    </td>
                                    <td class="p-4">
                                        <div class="flex items-center justify-center gap-3">
                                            {#if application.status === 'pending'}
                                                <button
                                                    class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                                    on:click={() => handleAccept(application)}
                                                    title="Accept"
                                                >
                                                    <span class="material-icons-sharp text-sm">check</span>
                                                </button>
                                                <button
                                                    class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                                    on:click={() => handleDecline(application)}
                                                    title="Decline"
                                                >
                                                    <span class="material-icons-sharp text-sm">close</span>
                                                </button>
                                            {:else}
                                            <span class="text-sm text-gray-500">
                              
                                                {#if application.status === 'interview'}
                                                <div class="flex space-x-2 mt-2">
                                                    <button 
                                                        on:click={() => handleInterview(application)}
                                                        aria-label="Schedule interview"
                                                        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
                                                        title={application.status === 'interview' ? 'Reschedule Interview' : 'Schedule Interview'}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                    aria-label="Schedule interview"
                                                        on:click={() => handleReject(application)}
                                                        class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
                                                        title="Make Decision"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                {/if}
                                            </span>
                                            {/if}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination Controls -->
                {#if totalPages > 1}
                    <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <div class="text-sm text-gray-600">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginatedApplications.length)} of {paginatedApplications.length} entries
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                class="px-3 py-1 rounded-lg border {currentPage === 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}"
                                on:click={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            {#each Array(totalPages) as _, i}
                                {#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
                                    <button
                                        class="w-8 h-8 rounded-lg flex items-center justify-center {
                                            currentPage === i + 1
                                                ? 'bg-blue-500 text-white'
                                                : 'hover:bg-gray-50'
                                        }"
                                        on:click={() => goToPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
                                    <span class="px-1">...</span>
                                {/if}
                            {/each}
                            
                            <button
                                class="px-3 py-1 rounded-lg border {currentPage === totalPages ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}"
                                on:click={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                {/if}
            </section>
        </main>
    </div>
{/if}