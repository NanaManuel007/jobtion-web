<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { clients, selectedClient, isLoading, clientActions } from '$lib/services/client_services/client.store';
    import AddJobDialog from './add_job_jobs_added/AddJobDialog.svelte';
    import AssignedCandidates from './assigned_candidate/AssignedCandidates.svelte';
    import CompanyDetailsTab from './CompanyDetailsTab.svelte';
    import JobsAddedTab from './add_job_jobs_added/JobsAddedTab.svelte';
    import PendingApprovals from './pending_approvals/PendingApprovals.svelte';
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
	import ClientInvoicesTab from './ClientInvoicesTab.svelte';

    let mounted = false;
    let showAddJobDialog = false;
    let fetchError = false;

    $: clientId = $page.params.id || '';

    $: activeTab = $page.url.searchParams.get('tab') || 'company';
    
    async function fetchClient() {
        try {
            fetchError = false;
            if (clientId) {
                await clientActions.getClientById(clientId);
            }
        } catch (error) {
            console.error('Failed to fetch client:', error);
            fetchError = true;
        }
    }
    
    function changeTab(tabId: string) {
        const url = new URL($page.url);
        url.searchParams.set('tab', tabId);
        goto(url.toString(), { replaceState: true, noScroll: true });
    }
    
    onMount(async () => {
        mounted = true;
        await fetchClient();
        console.log('Selected Client Data:', $selectedClient);
    });

    const tabs = [
        { id: 'company', label: 'Company Details', icon: 'business' },
        { id: 'jobs', label: 'Jobs Added', icon: 'work' },
        { id: 'candidates', label: 'Reports', icon: 'people' },
        { id: 'approvals', label: 'Pending Approvals', icon: 'pending_actions' }
    ];

    function handleAddJob(event: any) {
        console.log('New job:', event.detail.jobData);
        // Refresh client data after adding a job
        if (clientId) {
            fetchClient();
        }
    }
</script>


{#if mounted}
<div class="flex h-screen bg-white p-10 overflow-hidden">
    <!-- Side Navigation - Fixed Position -->
    <div class="fixed w-72 bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] top-10"
        in:fly={{ duration: 1000, delay: 300, x: -200 }}>
        <nav class="p-4">
            {#each tabs as tab}
                <button
                    class="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors overflow-hidden
                           {activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}"
                    on:click={() => changeTab(tab.id)}
                >
                    <span class="material-icons-sharp flex-shrink-0">{tab.icon}</span>
                    <span class="truncate">{tab.label}</span>
                </button>
            {/each}
        </nav>
    </div>

    <!-- Main Content Area - With Left Margin -->
    <div class="flex-1 p-8 ml-80 overflow-y-auto"
        in:fly={{ duration: 1000, delay: 300, x: 200 }}>
        {#if $isLoading}
            <div class="flex justify-center items-center h-full">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        {:else if fetchError}
            <div class="text-center p-10">
                <p class="text-xl text-gray-500 mb-4">Failed to load client data</p>
                <button 
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    on:click={fetchClient}
                >
                    Retry
                </button>
            </div>
        {:else if $selectedClient}
            {#key activeTab}
                <div 
                    in:fly={{ duration: 800, x: 100, opacity: 0 }}
                    out:fly={{ duration: 400, x: -100, opacity: 0 }}
                >
                    {#if activeTab === 'company'}
                        <CompanyDetailsTab client={$selectedClient} />
                    {:else if activeTab === 'jobs'}
                        <JobsAddedTab client={$selectedClient} />
                    {:else if activeTab === 'candidates'}
                        <ClientInvoicesTab client = {$selectedClient}/>
                    {:else if activeTab === 'approvals'}
                        <PendingApprovals client = {$selectedClient} />
                    {/if}
                </div>
            {/key}
        {:else}
            <div class="text-center p-10">
                <p class="text-xl text-gray-500">Client not found</p>
            </div>
        {/if}
    </div>
</div>

<AddJobDialog 
    bind:showDialog={showAddJobDialog}
    on:addJob={handleAddJob}
    on:closeDialog={() => showAddJobDialog = false}
    {clientId}
/>
{/if}

