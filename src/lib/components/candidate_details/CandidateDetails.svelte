<script lang="ts">
    import { page } from '$app/stores';
    import { candidateStore, } from '$lib/services/candidate_services/candidate.store';
    import UserDetailsTab from '$lib/components/candidate_details/user_details/UserDetailsTab.svelte';
    import UserAvailabilityTab from '$lib/components/candidate_details/user_availability/UserAvailabilityTab.svelte';
    import SubmittedTMSTab from '$lib/components/candidate_details/user_availability/submitted_tms/SubmittedTMSTab.svelte';
    import QueriesTab from './queries_and_complains/QueriesTab.svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';

    let mounted = false;
    let activeTab = 'details';
    let loading = false;

    $: candidateId = parseInt($page.params.id);

    onMount(async () => {
        loading = true;
        if (candidateId) {
            await candidateStore.fetchCandidateById(candidateId);
        }
        loading = false;
        mounted = true;
    });

   
    const tabs = [
        { id: 'details', label: 'Candidate Details', icon: 'person' },
        { id: 'availability', label: 'Availability', icon: 'event_available' },
        // { id: 'tms', label: 'Submitted TMS', icon: 'assignment_turned_in' },
        { id: 'queries', label: 'Feedbacks and Queries', icon: 'help_outline' },
    ];
</script>

{#if mounted}
<div class="flex h-screen bg-white p-10">
    <!-- Side Navigation -->
    <div class="w-72 h-50 pt-2 bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px]"
        in:fly={{ duration: 1000, delay: 300, x: -200 }}>
        <nav class="p-4">
            {#each tabs as tab}
                <button
                    class="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors
                           {activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}"
                    on:click={() => activeTab = tab.id}
                >
                    <span class="material-icons-sharp">{tab.icon}</span>
                    {tab.label}
                </button>
            {/each}
        </nav>
    </div>

    <div class="flex-1 p-8"
        in:fly={{ duration: 1000, delay: 300, x: 200 }}>
        {#if $candidateStore.loading}
            <div class="flex flex-col justify-center items-center h-64">
                <div class="relative w-24 h-24">
                    <div class="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75"></div>
                    <div class="absolute top-1 left-1 right-1 bottom-1 bg-white rounded-full"></div>
                    <div class="absolute top-3 left-3 right-3 bottom-3 animate-spin">
                        <div class="h-full w-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"></div>
                    </div>
                </div>
                <p class="mt-4 text-gray-600 font-medium animate-pulse">Loading candidate data...</p>
            </div>
        {:else if $candidateStore.error}
            <div class="p-8 text-center text-red-600">
                {$candidateStore.error}
            </div>
        {:else}
            {#key activeTab}
                <div 
                    in:fly={{ duration: 800, x: 100, opacity: 0 }}
                    out:fly={{ duration: 400, x: -100, opacity: 0 }}
                >
                    {#if activeTab === 'details'}
                        {#if $candidateStore.selectedCandidate.details}
                            <UserDetailsTab candidate={$candidateStore.selectedCandidate.details} 
                            candidateQualifications = {$candidateStore.selectedCandidate.qualifications}
                            candidateReferences = {$candidateStore.selectedCandidate.references}
                            candidateOtherDocuments = {$candidateStore.selectedCandidate.other_documents}
                             />
                        {:else}
                            <div class="p-8 text-center text-gray-600">No candidate details available</div>
                        {/if}
                    {:else if activeTab === 'availability'}
                        {#if $candidateStore.selectedCandidate.details}
                            <UserAvailabilityTab bookingsRequests = {$candidateStore.selectedCandidate.bookings} appliedJobs = {$candidateStore.selectedCandidate.applied_jobs} candidate={$candidateStore.selectedCandidate.details} />
                        {:else}
                            <div class="p-8 text-center text-gray-600">No candidate details available</div>
                        {/if}
                    <!-- {:else if activeTab === 'tms'}
                        {#if $candidateStore.selectedCandidate.details}
                            <SubmittedTMSTab candidate={$candidateStore.selectedCandidate.details} />
                        {:else}
                            <div class="p-8 text-center text-gray-600">No candidate details available</div>
                        {/if} -->
                    {:else if activeTab === 'queries'}
                        {#if $candidateStore.selectedCandidate.details}
                            <QueriesTab/>
                        {:else}
                            <div class="p-8 text-center text-gray-600">No candidate details available</div>
                        {/if}
                    {/if}
                </div>
            {/key}
        {/if}
    </div>
</div>
{/if}