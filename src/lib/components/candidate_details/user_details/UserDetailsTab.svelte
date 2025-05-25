<script lang="ts">
    import { fly } from 'svelte/transition';
    import type { Candidate, CandidateQualification, CandidateReference, CandidateOtherDocument } from '$lib/services/candidate_services/candidate.type';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
    import GeneralDetailsTab from './GeneralDetailsTab.svelte';
    import DocumentsTab from './DocumentsTab.svelte';

    $: loading = $candidateStore.loading;
    export let candidate: Candidate;
    export let candidateQualifications: CandidateQualification[];
    export let candidateReferences: CandidateReference[];
    export let candidateOtherDocuments: CandidateOtherDocument[];
    let activeTab = 'general';

    const tabs = [
        { id: 'general', label: 'General Details', icon: 'person' },
        { id: 'documents', label: 'Documents', icon: 'description' }
    ];
</script>

<div class="space-y-6">
    <!-- Tab Navigation -->
    {#if !loading}
    <div class="bg-gray-100/50 p-2 rounded-xl inline-flex gap-2">
        {#each tabs as tab}
            <button
                class="px-6 py-3 font-medium rounded-lg transition-all duration-200
                    {activeTab === tab.id 
                        ? 'bg-white text-gray-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}"
                on:click={() => activeTab = tab.id}
            >
                <div class="flex items-center gap-2">
                    <span class="material-icons-sharp text-sm">{tab.icon}</span>
                    {tab.label}
                </div>
            </button>
        {/each}
    </div>
    <!-- Tab Content -->
    {#key activeTab}
        <div 
            in:fly={{ x: 100, duration: 300, opacity: 0 }}
            out:fly={{ x: -100, duration: 300, opacity: 0 }}
        >
            {#if activeTab === 'general'}
                <GeneralDetailsTab {candidate} />
            {:else if activeTab === 'documents'}
            <DocumentsTab {candidate} qualifications={candidateQualifications} references={candidateReferences} otherDocuments={candidateOtherDocuments} />
            {/if}
        </div>
    {/key}
    {:else}
    <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>
    {/if}
</div>