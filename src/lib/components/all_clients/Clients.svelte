<script lang="ts">
    import { clients, totalClients, isLoading, clientActions } from '$lib/services/client_services/client.store';
    import type { ClientsType } from '$lib/services/client_services/client.type';
    import SearchBar from '$lib/components/all_clients/SearchBar.svelte';
    import CustomTable from '$lib/components/all_clients/CustomTable.svelte';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    let mounted = false;
    let searchTerm = '';
    // let sortColumn: keyof ClientsType | null = null;
    // let sortAscending = true;
    // let currentPage = 1;
    // const itemsPerPage = 10;

    onMount(() => {
        mounted = true;
        clientActions.fetchClients();
    });

    // This reactive statement will filter clients based on search term
    $: filteredClients = searchTerm 
        ? $clients.filter(client => 
            (client.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.company_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.phone_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (client.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        )
        : $clients;
        
    // Update search handler
    function handleSearch(event: CustomEvent) {
        searchTerm = event.detail;
    }
</script>

{#if mounted}
<div class="pt-10 pr-10 pl-10">
            <div class="w-full h-[10%] bg-white/25 p-3 flex items-center">
                <h1 class="text-5xl font-semibold pl-10">Clients</h1>
                <div class="flex-grow"></div>
                <div class="flex items-center gap-4">
                    <SearchBar bind:searchTerm on:search={handleSearch} />
                </div>
            </div>
            {#if $isLoading && filteredClients.length === 0}
            <div class="flex flex-col justify-center items-center h-64" in:fade={{ duration: 300 }}>
                <div class="relative w-24 h-24">
                    <div class="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75"></div>
                    <div class="absolute top-1 left-1 right-1 bottom-1 bg-white rounded-full"></div>
                    <div class="absolute top-3 left-3 right-3 bottom-3 animate-spin">
                        <div class="h-full w-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
                <p class="mt-4 text-gray-600 font-medium animate-pulse">Loading clients data...</p>
            </div>
            {:else}
                <CustomTable searchQuery={searchTerm} />
            {/if}

</div>
{/if}