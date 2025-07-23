<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
    import UserDetailsTab from '$lib/components/candidate_details/user_details/UserDetailsTab.svelte';
    import UserAvailabilityTab from '$lib/components/candidate_details/user_availability/UserAvailabilityTab.svelte';
    import SubmittedTMSTab from '$lib/components/candidate_details/user_availability/submitted_tms/SubmittedTMSTab.svelte';
    import QueriesTab from './queries_and_complains/QueriesTab.svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import type { DetailedCandidate } from '$lib/services/candidate_services/candidate.types';

    let mounted = false;
    let loading = false;
    let fetchError = false;
    let candidateData: DetailedCandidate | null = null;

    $: candidateId = $page.params.id || '';
    // Get active tab from URL parameters, default to 'details'
    $: activeTab = $page.url.searchParams.get('tab') || 'details';

    async function fetchCandidate() {
        try {
            fetchError = false;
            loading = true;
            if (candidateId) {
                const result = await candidateStore.getSingleCandidate(candidateId);
                if (result.success && result.data) {
                    candidateData = result.data;
                } else {
                    fetchError = true;
                }
            }
        } catch (error) {
            console.error('Failed to fetch candidate:', error);
            fetchError = true;
        } finally {
            loading = false;
        }
    }

    // Function to change tab and update URL
    function changeTab(tabId: string) {
        const url = new URL($page.url);
        url.searchParams.set('tab', tabId);
        goto(url.toString(), { replaceState: true, noScroll: true });
    }

    onMount(async () => {
        mounted = true;
        await fetchCandidate();
        console.log('Candidate Data:', candidateData);
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
                    on:click={() => changeTab(tab.id)}
                >
                    <span class="material-icons-sharp">{tab.icon}</span>
                    {tab.label}
                </button>
            {/each}
        </nav>
    </div>

    <div class="flex-1 p-8"
        in:fly={{ duration: 1000, delay: 300, x: 200 }}>
        {#if loading}
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
        {:else if fetchError}
            <div class="text-center p-10">
                <p class="text-xl text-gray-500 mb-4">Failed to load candidate data</p>
                <button 
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    on:click={fetchCandidate}
                >
                    Retry
                </button>
            </div>
        {:else if candidateData}
            {#key activeTab}
                <div 
                    in:fly={{ duration: 800, x: 100, opacity: 0 }}
                    out:fly={{ duration: 400, x: -100, opacity: 0 }}
                >
                    {#if activeTab === 'details'}
                        <UserDetailsTab candidate={candidateData} />
                    {:else if activeTab === 'availability'}
                        <UserAvailabilityTab candidate={candidateData} />
                    {:else if activeTab === 'queries'}
                        <QueriesTab candidate={candidateData} />
                    {/if}
                </div>
            {/key}
        {:else}
            <div class="text-center p-10">
                <p class="text-xl text-gray-500">Candidate not found</p>
            </div>
        {/if}
    </div>
</div>
{/if}