<!-- <script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Dialog from '../general_components/Dialog.svelte';
	import type { Application } from '$lib/services/application_services/application.types';
	import { date } from 'zod';

    export let show = false;
    export let application: Application | null = null;

    const dispatch = createEventDispatcher();

    let interviewDetails = {
        date: application?.interview_date,
        time: application?.interview_time,
        interviewBy: application?.interview_by,
        interviewLink: application?.interview_invite_link,
    };

    const documentOptions = [
        'CV/Resume',
        'Teaching Certificate',
        'ID/Passport',
        'Academic Transcripts',
        'Reference Letters',
        'Police Clearance',
        'Medical Certificate'
    ];

    const durationOptions = [
        { value: '0.5', label: '30 minutes' },
        { value: '1', label: '1 hour' },
        { value: '1.5', label: '1.5 hours' },
        { value: '2', label: '2 hours' }
    ];

    function handleSubmit() {
        dispatch('scheduleInterview', {
            applicationId: application?.id,
            ...interviewDetails
        });
        resetForm();
    }

    function resetForm() {
        interviewDetails = {
            date: '',
            time: '',
            interviewBy: '',
            interviewLink: '1',
        };
    }

    function handleClose() {
        resetForm();
        dispatch('close');
    }
</script> -->
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
        date: '',
        time: '',
        interviewBy: '',
        interviewLink: ''
    });

    $effect(() => {
        if (application) {
            interviewDetails.date = application.interview_date;
            interviewDetails.time = application.interview_time;
            interviewDetails.interviewBy = application.company_name;
            interviewDetails.interviewLink = application.interview_invite_link;
        }
    });

	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let isUpdating: Record<string, boolean> = $state({});
        let showToast = $state(false);

        async function handleSubmit() {
        if (!application?.id) return;
        
        try {
            await applicationStore.setInterview(
                application.id,
                {
                    interview_date: interviewDetails.date,
                    interview_time: interviewDetails.time,
                    interview_by: interviewDetails.interviewBy,
                    interview_link: interviewDetails.interviewLink
                }
            );
            
            // Since setInterview returns void, we assume success if no error is thrown
            toastType = 'success';
            toastMessage = 'Interview scheduled successfully';
            showToast = true;
            
            dispatch('close');
            resetForm();
        } catch (error) {
            toastType = 'error';
            toastMessage = 'Failed to schedule interview';
            showToast = true;
        }
    }
    function resetForm() {
        interviewDetails = {
            date: '',
            time: '',
            interviewBy: '',
            interviewLink: '1',
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
                Scheduling interview for {application?.first_name + " "+application?.last_name} - {application?.job_title} at {application?.company_name}
            </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
                <label for="interview-date" class="block text-sm font-medium text-gray-700">Date</label>
                    
                <input
                    type="date"
                    bind:value={interviewDetails.date}
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
                    bind:value={interviewDetails.time}
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
            </div>
        </div>

        <div class="space-y-2">
            <label for="venue" class="block text-xs font-medium text-gray-700">
                Interview By: {application?.interview_by}
            </label>
            <!-- <input
                type="text"
                bind:value={interviewDetails.venue}
                placeholder="Enter interview location"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
            /> -->
        </div>

        <!-- <div class="space-y-2">
            <label for="duration" class="block text-sm font-medium text-gray-700">
                Duration
            </label>
            <select
                bind:value={interviewDetails.duration}
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                {#each durationOptions as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div> -->

        <!-- <div class="space-y-2">
            <label for="required_documents" class="block text-sm font-medium text-gray-700">
                Required Documents
            </label>
            <div class="grid grid-cols-2 gap-2">
                {#each documentOptions as document}
                    <label class="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            value={document}
                            bind:group={interviewDetails.documents}
                            class="rounded text-blue-600 focus:ring-blue-400"
                        />
                        <span class="text-sm">{document}</span>
                    </label>
                {/each}
            </div>
        </div> -->

        <div class="space-y-2">
            <label for="additional_notes" class="block text-sm font-medium text-gray-700">
               Interview Link
            </label>
            <textarea
                bind:value={interviewDetails.interviewLink}
                placeholder="Any additional information for the candidate..."
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            ></textarea>
        </div>
    </div>

    <svelte:fragment slot="actions">
        <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            on:click={handleClose}
        >
            Cancel
        </button>
        <button
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            on:click={handleSubmit}
        >
            Schedule Interview
        </button>
    </svelte:fragment>
</Dialog>