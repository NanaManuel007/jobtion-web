<script lang="ts">
    import { onMount } from 'svelte';
    import AddCompanyModal from './AddNewClient.svelte';
    import ExportMenu from './ExportMenu.svelte';
    import { goto } from '$app/navigation';
    import { clients, clientActions, currentPage, totalPages, totalCount, pageSize, isLoading } from '$lib/services/client_services/client.store';
    import type { ClientsType, CustomerStatus } from '$lib/services/client_services/client.type';
    import { fade } from 'svelte/transition';
    import AddNewClient from './AddNewClient.svelte';
    import { API_CONFIG } from '$lib/services/api';

    // State declarations using $state
    let sortColumn = $state<keyof ClientsType | null>(null);
    let sortAscending = $state(true);
    let showExportMenu = $state(false);
    let showEditModal = $state(false);
    let showAddModal = $state(false);
    let client_detail = $state<ClientsType | null>(null);

    // Remove local pagination since we're using server-side pagination
    // All pagination is now handled by the store

    function selectedClient(clientId: string) {
        const selectedClient = $clients.find(client => client.id === clientId);
        if (selectedClient) {
            showEditModal = true;
            client_detail = selectedClient;
            console.log(client_detail);
        }
    }

    // Event handlers and functions
    onMount(() => {
        // No need to fetch here - parent component handles initial fetch
    });

    function handleClientAdded() {
        showAddModal = false;
        clientActions.refresh(); // Refresh current page
    }

    async function changePage(page: number) {
        await clientActions.changePage(page);
    }

    async function changePageSize(size: number) {
        await clientActions.changePageSize(size);
    }

    function handleSort(column: keyof ClientsType) {
        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }
        // TODO: Implement server-side sorting if needed
    }

    function handleAddNewClient() {
        showAddModal = !showAddModal;
    }

    function toggleExportMenu() {
        showExportMenu = !showExportMenu;
    }

    function mapVerificationStatus(client: ClientsType): CustomerStatus {
        return client.adminVerification === true ? 'verified' : 'unverified';
    }

    const getStatusColor = (status: CustomerStatus) => ({
        verified: 'bg-[#86e49d] text-[#006b21]',
        unverified: 'bg-[#d893a3] text-[#b30021]'
    })[status];

    function handleView(clientId: string) {
        goto(`/private/all_clients/clients_details/${clientId}`);
    }

    function handleEmail(id: string) {
        console.log('Email client:', id);
    }

    function handleEdit(clientId: number) {
        goto(`/private/all_clients/clients_details/${clientId}`);
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
</script>

<AddNewClient
    showModal={showEditModal}
    existingClient={client_detail}
    on:close={() => showEditModal = false}
    on:clientAdded={() => showEditModal = false}
/>

<div class="pt-4">
    <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
        <div class="pr-4 pb-4 flex justify-between items-center">
            <div class="relative w-64">
                <!-- Search is now handled by parent component -->
            </div>
            
            <div class="flex gap-4">
                <div class="relative">
                    {#if showExportMenu}
                        <ExportMenu customers={$clients} />
                    {/if}
                    <button 
                        on:click|stopPropagation={toggleExportMenu}
                        class="h-12 bg-gray-200 text-gray-600 px-6 py-2 rounded-full flex items-center gap-2 hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                        <span class="material-icons-sharp">download</span>
                        <span>Export</span>
                    </button>
                </div>
    
                <button 
                    on:click={handleAddNewClient}
                    class="h-11 bg-gray-500 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-gray-600 transition-all duration-300 hover:scale-105 shadow-md"
                >
                    <span class="material-icons-sharp">add_circle</span>
                    <span>New Client</span>
                </button>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th class="text-left p-4 font-medium text-gray-600">Client</th>
                        <th class="text-left p-4 font-medium text-gray-600">Email</th>
                        <th class="text-left p-4 font-medium text-gray-600">Location</th>
                        <th class="text-left p-4 font-medium text-gray-600">Joined Date</th>
                        <th class="text-left p-4 font-medium text-gray-600">Phone Number</th>
                        <th class="text-center p-4 font-medium text-gray-600">Verification Status</th>
                        <th class="text-center p-4 font-medium text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each $clients as client}
                        <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                        <img src={client.profilePictureUrl !== null ? API_CONFIG.IMAGE_URL + client.profilePictureUrl : '/images/default.png'} 
                                             alt={client.companyName} 
                                             class="w-full h-full object-cover">
                                    </div>
                                    <span class="font-medium">{client.companyName}</span>
                                </div>
                            </td>
                            <td class="p-4">{client.email}</td>
                            <td class="p-4">{client.address || 'N/A'}</td>
                            <td class="p-4">{formatDate(client.createdAt)}</td>
                            <td class="p-4">{client.phoneNumber || 'N/A'}</td>
                            <td class="p-4 text-center">
                                <span class="inline-block px-2 py-1 rounded-full text-xs font-medium {getStatusColor(mapVerificationStatus(client))}">
                                    {mapVerificationStatus(client).charAt(0).toUpperCase() + mapVerificationStatus(client).slice(1)}
                                </span>
                            </td>
                            <td class="p-4">
                                <div class="flex items-center justify-left gap-2">
                                    <button
                                        class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                        on:click={() => selectedClient(client.id)}
                                    >
                                        <span class="material-icons-sharp text-gray-600">edit</span>
                                    </button>
                                    <button
                                        class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                        on:click={() => handleView(client.id)}
                                    >
                                        <span class="material-icons-sharp text-gray-600">visibility</span>
                                    </button>
                                    <button
                                        class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                        on:click={() => handleEmail(client.id)}
                                    >
                                        <span class="material-icons-sharp text-gray-600">email</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        {#if $totalPages > 0}
            <div class="flex items-center justify-between px-6 py-4 border-t">
                <div class="flex items-center gap-4">
                    <div class="text-sm text-gray-600">
                        Showing {($currentPage - 1) * $pageSize + 1} to {Math.min($currentPage * $pageSize, $totalCount)} of {$totalCount} entries
                    </div>
                    <select 
                        class="text-sm border rounded px-2 py-1"
                        value={$pageSize}
                        on:change={(e:any) => changePageSize(parseInt(e.target.value))}
                    >
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>
                <div class="flex items-center gap-2">
                    <button 
                        class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={$currentPage === 1 || $isLoading}
                        on:click={() => changePage($currentPage - 1)}
                    >
                        <span class="material-icons-sharp">chevron_left</span>
                    </button>
                    
                    {#each Array(Math.min($totalPages, 5)) as _, i}
                        {@const pageNum = Math.max(1, Math.min($totalPages - 4, $currentPage - 2)) + i}
                        {#if pageNum <= $totalPages}
                            <button 
                                class="min-w-[32px] h-8 rounded-lg transition-colors {$currentPage === pageNum ? 'bg-gray-200' : 'hover:bg-gray-100'} disabled:opacity-50"
                                disabled={$isLoading}
                                on:click={() => changePage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        {/if}
                    {/each}
                    
                    <button 
                        class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={$currentPage === $totalPages || $isLoading}
                        on:click={() => changePage($currentPage + 1)}
                    >
                        <span class="material-icons-sharp">chevron_right</span>
                    </button>
                </div>
            </div>
        {/if}
        
        <AddCompanyModal 
            showModal={showAddModal} 
            on:close={() => showAddModal = false}
            on:clientAdded={handleClientAdded}
        />
    </main>
</div>

<svelte:window on:click={() => showExportMenu = false} />