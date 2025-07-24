
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Dialog from '../general_components/Dialog.svelte';
    import type { Application } from '$lib/services/application_services/application.types';
    import { date } from 'zod';
	import { applicationStore } from '$lib/services/application_services/application.stores';
	import Toast from '../general_components/Toast.svelte';

    const { show, application = null } = $props<{
        show: boolean;
        application: Application | null
    }>();

    const dispatch = createEventDispatcher();
    let interviewDetails = $state({
        interviewDate: '',
        interviewTime: '',
        interviewLocation: '',
        interviewInviteLink: '',
        interviewBy: '',
        interviewNotes: ''
    });

    $effect(() => {
        if (application) {
            interviewDetails.interviewDate = application.interviewDate || '';
            interviewDetails.interviewTime = application.interviewTime || '';
            interviewDetails.interviewLocation = application.interviewLocation || '';
            interviewDetails.interviewInviteLink = application.interviewInviteLink || '';
            // Provide a better default for interviewBy
            interviewDetails.interviewBy = application.interviewBy || application.companyName || 'HR Team';
            interviewDetails.interviewNotes = application.interviewNotes || '';
        }
    });

    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let isUpdating: Record<string, boolean> = $state({});
    let showToast = $state(false);
    let isSubmitting = $state(false); // Add loading state

    async function handleSubmit() {
        if (!application?.id) return;
        
        // Add validation
        if (!interviewDetails.interviewBy.trim()) {
            toastType = 'error';
            toastMessage = 'Interview By field is required';
            showToast = true;
            return;
        }
        
        if (!interviewDetails.interviewLocation.trim()) {
            toastType = 'error';
            toastMessage = 'Interview Location field is required';
            showToast = true;
            return;
        }
        
        isSubmitting = true; // Start loading
        
        try {
            await applicationStore.setInterview(
                application.id,
                application.client.id,
                {
                    interviewDate: new Date(interviewDetails.interviewDate).toISOString(),
                    interviewTime: interviewDetails.interviewTime,
                    interviewLocation: interviewDetails.interviewLocation,
                    interviewInviteLink: interviewDetails.interviewInviteLink,
                    interviewBy: interviewDetails.interviewBy,
                    interviewNotes: interviewDetails.interviewNotes
                }
            );
            
            toastType = 'success';
            toastMessage = 'Interview scheduled successfully';
            showToast = true;
            
            dispatch('close');
            resetForm();
        } catch (error) {
            toastType = 'error';
            toastMessage = 'Failed to schedule interview';
            showToast = true;
        } finally {
            isSubmitting = false; // Stop loading
        }
    }
    
    function resetForm() {
        interviewDetails = {
            interviewDate: '',
            interviewTime: '',
            interviewLocation: '',
            interviewInviteLink: '',
            interviewBy: '',
            interviewNotes: ''
        };
    }

    function handleClose() {
        resetForm();
        applicationStore.fetchApplications()
        dispatch('close');
    }
</script>

<Toast bind:show={showToast} message={toastMessage} type={toastType} duration={3000} />

<Dialog show={show} title="Schedule Interview" onClose={handleClose}>
    <div class="space-y-6">
        <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900">Interview Details</h3>
            <p class="text-sm text-gray-800 mt-1">
                Scheduling interview for {application?.candidate.firstName + " "+application?.candidate.lastName} - {application?.jobTitle} at {application?.companyName}
            </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <label for="interview-date" class="block text-sm font-medium text-gray-700">Date</label>
                <input
                    type="date"
                    bind:value={interviewDetails.interviewDate}
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    min={new Date().toISOString().split('T')[0]}
                    required
                />
            </div>

            <div class="space-y-2">
                <label for="time" class="block text-sm font-medium text-gray-700">
                    Time
                </label>
                <input
                    type="time"
                    bind:value={interviewDetails.interviewTime}
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
            </div>
        </div>

        <div class="space-y-2">
            <label for="location" class="block text-sm font-medium text-gray-700">
                Interview Location
            </label>
            <input
                type="text"
                bind:value={interviewDetails.interviewLocation}
                placeholder="Enter interview location (e.g., Office, Zoom, etc.)"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
            />
        </div>

        <div class="space-y-2">
            <label for="interviewer" class="block text-sm font-medium text-gray-700">
                Interview By <span class="text-red-500">*</span>
            </label>
            <input
                type="text"
                bind:value={interviewDetails.interviewBy}
                placeholder="Enter interviewer name"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
            />
        </div>


        <div class="space-y-2">
            <label for="invite_link" class="block text-sm font-medium text-gray-700">
               Interview Link
            </label>
            <textarea
                bind:value={interviewDetails.interviewInviteLink}
                placeholder="Enter meeting link or additional instructions..."
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            ></textarea>
        </div>

        <div class="space-y-2">
            <label for="notes" class="block text-sm font-medium text-gray-700">
               Interview Notes
            </label>
            <textarea
                bind:value={interviewDetails.interviewNotes}
                placeholder="Any additional notes for the interview..."
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            ></textarea>
        </div>
    </div>

    <svelte:fragment slot="actions">
        <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            on:click={handleClose}
            disabled={isSubmitting}
        >
            Cancel
        </button>
        <button
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            on:click={handleSubmit}
            disabled={isSubmitting}
        >
            {#if isSubmitting}
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scheduling...
            {:else}
                Schedule Interview
            {/if}
        </button>
    </svelte:fragment>
</Dialog>