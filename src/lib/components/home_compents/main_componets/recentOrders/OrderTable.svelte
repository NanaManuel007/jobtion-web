<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { applicationStore } from '$lib/services/application_services/application.stores';
	import type { Application } from '$lib/services/application_services/application.types';
    import Dialog from '../../../general_components/Dialog.svelte';
    import Toast from '../../../general_components/Toast.svelte';
	import { API_CONFIG } from '$lib/services/api';
    let selectedApplication = $state<Application | null>(null);
        let applications = $state<Application[]>([]);
    let mounted = $state(false);
    let loading = $state(true);
    let showAcceptDialog = $state(false);
    let showDeclineDialog = $state(false);
    onMount(async () => {
        try {
            await applicationStore.fetchApplications();
            applications = $applicationStore.applications
                .filter(app => app.status === "applied").
                filter(app => app.candidate.firstName !=="[Deleted]")
                .slice(0, 6);
            mounted = true;
        } finally {
            loading = false;
        }
    });

    function handleViewMore() {
        goto('/private/all_applications');
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

    function handleDecline(application: Application) {
        selectedApplication = application;
        showDeclineDialog = true;
    }

    async function confirmAccept() {
        if (selectedApplication) {
            try {
                await applicationStore.acceptApplication(selectedApplication.id);
                showSuccessToast(`Successfully accepted ${selectedApplication.first_name} ${selectedApplication.last_name}'s application`);
                showAcceptDialog = false;
                selectedApplication = null;
                // Reload the table
                await applicationStore.fetchApplications();
                applications = $applicationStore.applications
                    .filter(app => app.status === "pending")
                    .slice(0, 6);
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
                await applicationStore.declineApplication(selectedApplication.id);
                showSuccessToast(`Successfully declined ${selectedApplication.candidate.firstName} ${selectedApplication.candidate.lastName}'s application`);
                showDeclineDialog = false;
                selectedApplication = null;
                // Reload the table
                await applicationStore.fetchApplications();
                applications = $applicationStore.applications
                    .filter(app => app.status === "pending")
                    .slice(0, 6);
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
            Are you sure you want to accept {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName} for the {selectedApplication.jobTitle} role at {selectedApplication.companyName}?
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
            Are you sure you want to decline {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName} for the {selectedApplication.jobTitle} role at {selectedApplication.companyName}?
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
{#if mounted}
<div class="pt-10">
    <h2 class="text-lg font-semibold mb-4">Incoming Permanent Applications</h2>
    <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
        
        <section class="w-full overflow-hidden">
  

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th class="text-left p-4 font-medium text-gray-600">Candidate</th>
                            <th class="text-left p-4 font-medium text-gray-600">Position</th>
                            <th class="text-left p-4 font-medium text-gray-600">Company</th>
                            <th class="text-left p-4 font-medium text-gray-600">Job Type</th>
                            <th class="text-center p-4 font-medium text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each applications as order}
                            <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                    
                                            <img class= "w-16 h-16 rounded-full object-cover "
                                            src={order.candidate.profilePictureUrl !==null ? API_CONFIG.IMAGE_URL +order.candidate.profilePictureUrl : 
                                            '/user_images/default.jpg'} alt={`${order.candidate.firstName}`} >
                                                <!-- <img src={order.userImage} alt={order.userName} class="w-full h-full object-cover"> -->
                                            
                                        </div>
                                        <span class="font-medium">{order.candidate.firstName}</span>
                                    </div>
                                </td>
                                <td class="p-4">{order.jobTitle}</td>
                                <td class="p-4">{order.companyName}</td>
                                <td class="p-4">{order.jobType}</td>
                                <td class="hidden sm:table-cell">
                                  <div class="flex justify-center gap-4">
                                    <button
                                    class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                                    on:click={() => handleAccept(order)}
                                    title="Accept"
                                >
                                    <span class="material-icons-sharp text-sm">check</span>
                                </button>
                                <button
                                    class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                                    on:click={() => handleDecline(order)}
                                    title="Decline"
                                >
                                    <span class="material-icons-sharp text-sm">close</span>
                                </button>    
                                </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                
            </div>

        </section>
        
    </main>
    <div class="flex justify-center mt-4">
      <button 
          class="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm font-medium transition-colors justify-center"
          on:click={handleViewMore}
      >
          View all bookings
          <span class="material-icons-sharp text-sm">arrow_forward</span>
      </button>
  </div>
</div>
{/if}


