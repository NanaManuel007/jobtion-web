<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';

    export let showDialog = false;
    export let jobTitle = '';
    export let jobId: number;
    export let currentCandidates: Array<{
        id: number;
        name: string;
        email: string;
        status: string;
        role?: string;
    }> = [];

    const dispatch = createEventDispatcher();

    // Mock available candidates (replace with your actual data source)
    const availableCandidates = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Available', role: 'Frontend Developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Available', role: 'UI/UX Designer' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'Available', role: 'Backend Developer' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'Available', role: 'Product Manager' },
    ];

    let searchQuery = '';
    let assignedSearchQuery = ''; // Add this new search state
    let localCurrentCandidates: typeof currentCandidates = [];

    // Add new reactive statement for filtering assigned candidates
    $: filteredAssignedCandidates = localCurrentCandidates.filter(c => 
        c.name.toLowerCase().includes(assignedSearchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(assignedSearchQuery.toLowerCase()) ||
        c.role?.toLowerCase().includes(assignedSearchQuery.toLowerCase())
    );

    // Initialize local candidates when dialog opens or currentCandidates changes
    $: if (showDialog || currentCandidates) {
        localCurrentCandidates = [...currentCandidates];
    }

    $: filteredCandidates = availableCandidates
        .filter(c => !localCurrentCandidates.some(cc => cc.id === c.id))
        .filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    function handleAddCandidate(candidate: typeof availableCandidates[0]) {
        // Update local state immediately
        localCurrentCandidates = [...localCurrentCandidates, { ...candidate }];
        // Dispatch event for parent component
        dispatch('addCandidate', { jobId, candidate });
    }

    function handleRemoveCandidate(candidateId: number) {
        // Update local state immediately
        localCurrentCandidates = localCurrentCandidates.filter(c => c.id !== candidateId);
        // Dispatch event for parent component
        dispatch('removeCandidate', { jobId, candidateId });
    }

    function handleClose() {
        showDialog = false;
    }
</script>

{#if showDialog}
<div 
    class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
    role="dialog"
    aria-modal="true"
    on:click={handleClose}
    on:keydown={e => e.key === 'Escape' && handleClose()}
    tabindex="-1"
    transition:fade
>
    <div 
        class="bg-white rounded-2xl w-[95%] md:w-[900px] max-h-[90vh] shadow-xl flex flex-col"
        role="dialog"
        on:keydown={e => e.key === 'Escape' && handleClose()}
        tabindex="0"
        transition:fly={{ y: 20, duration: 300 }}
        on:click|stopPropagation
    >
        <!-- Header -->
        <div class="p-6 border-b flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Manage Candidates</h2>
                <p class="text-gray-600 mt-1">Job: {jobTitle}</p>
            </div>
            <button 
                class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                on:click={handleClose}
            >
                <span class="material-icons-sharp text-gray-600">close</span>
            </button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
            <!-- Left side: Current Candidates -->
             
            <div class="w-full md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Assigned Candidates</h3>
                {#if localCurrentCandidates.length === 0}
                <div class="text-center py-4 md:py-8 text-gray-500">
                    <span class="material-icons-sharp text-3xl md:text-4xl mb-2">group_off</span>
                    <p>No candidates assigned yet</p>
                </div>
            {:else}
                <div class="space-y-3">
                    <div class="relative mb-4 md:mb-6">
                        <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input 
                            type="text"
                            bind:value={assignedSearchQuery}
                            placeholder="Search assigned candidates..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                        />
                    </div>
                    {#if filteredAssignedCandidates.length === 0}
                        <div class="text-center py-4 text-gray-500">
                            <span class="material-icons-sharp text-2xl mb-2">search_off</span>
                            <p>No matching candidates found</p>
                        </div>
                    {:else}
                        {#each filteredAssignedCandidates as candidate}
                            <div class="p-3 md:p-4 border rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div class="flex justify-between items-start gap-4">
                                    <div class="min-w-0 flex-1">
                                        <h4 class="font-medium text-gray-800 truncate">{candidate.name}</h4>
                                        <p class="text-sm text-gray-600 truncate">{candidate.email}</p>
                                        {#if candidate.role}
                                            <span class="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                {candidate.role}
                                            </span>
                                        {/if}
                                    </div>
                                    <button 
                                        class="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                        on:click={() => handleRemoveCandidate(candidate.id)}
                                    >
                                        <span class="material-icons-sharp">person_remove</span>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            {/if}
            </div>

            <!-- Right side: Available Candidates -->
            <div class="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-700 mb-4">Available Candidates</h3>
                
                <!-- Search -->
                <div class="relative mb-4 md:mb-6">
                    <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input 
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search candidates..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                    />
                </div>

                <div class="space-y-3">
                    {#each filteredCandidates as candidate}
                        <div class="p-3 md:p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div class="flex justify-between items-start gap-4">
                                <div class="min-w-0 flex-1">
                                    <h4 class="font-medium text-gray-800 truncate">{candidate.name}</h4>
                                    <p class="text-sm text-gray-600 truncate">{candidate.email}</p>
                                    <span class="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                        {candidate.role}
                                    </span>
                                </div>
                                <button 
                                    class="text-green-500 hover:text-green-600 p-1.5 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
                                    on:click={() => handleAddCandidate(candidate)}
                                >
                                    <span class="material-icons-sharp">person_add</span>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
{/if}