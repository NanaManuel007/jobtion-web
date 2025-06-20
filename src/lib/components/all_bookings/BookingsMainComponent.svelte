
<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import SearchBar from '$lib/components/all_clients/SearchBar.svelte';
    import Dialog from '../general_components/Dialog.svelte';
    import Toast from '../general_components/Toast.svelte';
    import { applicationStore } from '$lib/services/application_services/application.stores';
    import type { Application } from '$lib/services/application_services/application.types';
	import { API_CONFIG } from '$lib/services/api';

    let mounted = $state(false);
    let searchTerm = $state('');
    let selectedCompany = $state('All Companies');
    let showAcceptDialog = $state(false);
    let showDeclineDialog = $state(false);
    let selectedApplication = $state<Application | null>(null);

    // Add pagination variables
    let currentPage = $state(1);
    const itemsPerPage = 7;
    let totalPages = $state(1);
    let paginatedApplications = $state<Application[]>([]);

    const statusOptions = ['All', 'Pending', 'Accepted', 'Declined'];
    let companies = $state<string[]>(['All Companies']);
    let applications = $state<Application[]>([]);

    // Subscribe to the application store
    applicationStore.subscribe(state => {
        applications = state.applications;
        // Update companies list
        companies = ['All Companies', ...new Set(applications.map(app => app.company_name))];
    });

    onMount(async () => {
        await applicationStore.fetchApplications();
        mounted = true;
    });

    // Modified to include pagination and filtering
    let selectedStatus = $state('Pending');

  
    $effect(() => {
        const filtered = applications.filter(app => {
            const matchesSearch = searchTerm === '' ||
                `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.job_title.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCompany = selectedCompany === 'All Companies' || app.company_name === selectedCompany;
            const matchesStatus = selectedStatus === 'All' || 
                app.status.toLowerCase() === selectedStatus.toLowerCase();
            const matchesJobType = app.job_type === 'Temporary';
            
            return matchesSearch && matchesCompany && matchesStatus && matchesJobType;
        });

        totalPages = Math.ceil(filtered.length / itemsPerPage);
        currentPage = Math.min(currentPage, totalPages) || 1;
        
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

    function handleViewClient(clientId: number) {
        goto(`/private/all_clients/clients_details/${clientId}`);
    }

    function handleAccept(application: Application) {
        selectedApplication = application;
        showAcceptDialog = true;
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

    // function confirmAccept() {
    //     if (selectedApplication) {
    //         selectedApplication.status = 'accepted';
    //         showSuccessToast(`Successfully accepted ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
    //     }
    //     showAcceptDialog = false;
    //     selectedApplication = null;
    // }

    function handleDecline(application: Application) {
        selectedApplication = application;
        showDeclineDialog = true;
    }

    async function confirmAccept() {
        if (selectedApplication) {
            try {
                await applicationStore.acceptApplication(selectedApplication.id);
                console.log(selectedApplication.id)
                showSuccessToast(`Successfully accepted ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
                showAcceptDialog = false;
                selectedApplication = null;
            } catch (error) {
                toastType = 'error';
                toastMessage = 'Failed to accept application';
                showToast = true;
            }
        }
    }

    async function confirmDecline() {
        if (selectedApplication) {
            try {
                console.log(selectedApplication.id)
                await applicationStore.declineApplication(selectedApplication.id);
                showSuccessToast(`Successfully declined ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
                showDeclineDialog = false;
                selectedApplication = null;
             
            } catch (error) {
                toastType = 'error';
                toastMessage = 'Failed to decline application';
                showToast = true;
            }
        }
    }
</script>
{#if showAcceptDialog && selectedApplication}
    <Dialog
        show={showAcceptDialog && selectedApplication}
        title="Confirm Acceptance"
        onClose={() => showAcceptDialog = false}
    >
        <p class="text-gray-600">
            Are you sure you want to accept {selectedApplication.first_name} {selectedApplication.last_name} for the {selectedApplication.job_title} role at {selectedApplication.company_name}?
        </p>
        
        <svelte:fragment slot="actions">
            <button
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                on:click={() => showAcceptDialog = false}
            >
                No
            </button>
            <button
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                on:click={confirmAccept}
            >
                Yes
            </button>
        </svelte:fragment>
    </Dialog>
{/if}

<Toast 
    show={showToast}
    message={toastMessage}
    type={toastType}
/>

{#if showDeclineDialog && selectedApplication}
    <Dialog
        show={showDeclineDialog && selectedApplication}
        title="Confirm Decline"
        onClose={() => showDeclineDialog = false}
    >
        <p class="text-gray-600">
            Are you sure you want to decline {selectedApplication.first_name} {selectedApplication.last_name} for the {selectedApplication.job_title} role at {selectedApplication.company_name}?
        </p>
        
        <svelte:fragment slot="actions">
            <button
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                on:click={() => showDeclineDialog = false}
            >
                No
            </button>
            <button
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                on:click={confirmDecline}
            >
                Yes
            </button>
        </svelte:fragment>
    </Dialog>
{/if}

<!-- {#if mounted} -->
    <div class="pt-10 pr-10 pl-10">
        <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
            <section class="w-full overflow-hidden">
                <div class="w-full bg-white/25 p-6 flex items-center">
                    <h1 class="text-3xl font-semibold">Bookings</h1>
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

                {#if !mounted}
                    <div class="flex items-center justify-center p-8">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span class="ml-3 text-gray-600">Loading bookings...</span>
                    </div>
                {:else}
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
                                                            src={application.profile_picture !==null ? API_CONFIG.IMAGE_URL +application.profile_picture : '/user_images/default.jpg'} 
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
                                    <td class="p-4 flex flex-col gap-3 justify-center items-start">
                                        <span class="font-medium text-gray-700">{application.company_name}</span>
                                        <button
                                        class="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                        on:click={() => handleViewClient(application.company_id)}
                                    >
                                        View Profile
                                    </button>
                                    </td>
                                    <td class="p-4">
                                        <span class="font-mono text-sm">{application.id}</span>
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
                                                    {application.status}
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
                {/if}
            </section>
        </main>
    </div>
<!-- {/if} -->