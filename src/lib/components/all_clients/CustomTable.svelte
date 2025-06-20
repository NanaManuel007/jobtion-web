<script lang="ts">
    import { onMount } from 'svelte';
    import AddCompanyModal from './AddNewClient.svelte';
    import ExportMenu from './ExportMenu.svelte';
    import { goto } from '$app/navigation';
    import { clients, clientActions } from '$lib/services/client_services/client.store';
    // import type { AppliedCandidate, ClientsType, SelectedClientType } from '$lib/services/client_services/client.type';
    import type { ClientsType,CustomerStatus } from '$lib/services/client_services/client.type';
    import { fade } from 'svelte/transition';
    import AddNewClient from './AddNewClient.svelte';
	import { number } from 'zod';
	import { API_CONFIG } from '$lib/services/api';

    // State declarations using $state
    let sortColumn = $state<keyof ClientsType | null>(null);
    let sortAscending = $state(true);
    // let searchQuery = $state('');
    let showExportMenu = $state(false);
    let showEditModal = $state(false);
    let currentPage = $state(1);
    let showAddModal = $state(false);
    const itemsPerPage = 10;
    const { searchQuery } = $props<{
        searchQuery: string;

    }>();

    // Computed values using $derived
    let filteredClients = $derived(
        searchQuery
            ? $clients.filter(client =>
                client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : $clients
    );

    let sortedClients = $derived(
        sortColumn
            ? [...filteredClients].sort((a, b) => {
                // Type assertion to ensure sortColumn is keyof ClientsType
                const column = sortColumn as keyof ClientsType;
                const aValue = a[column];
                const bValue = b[column];
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortAscending
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                } else {
                    return sortAscending
                        ? (aValue as any) - (bValue as any)
                        : (bValue as any) - (aValue as any);
                }
            })
            : filteredClients
    );

    let totalPages = $derived(Math.ceil(sortedClients.length / itemsPerPage));
    let paginatedClients = $derived(
        sortedClients.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
    );
    let client_detail = $state<ClientsType | null>(null);

    function selectedClient(clientId: number) {
        const selectedClient = paginatedClients.find(client => client.id === clientId);
        if (selectedClient) {
            showEditModal = true;
            client_detail = selectedClient;
            console.log(client_detail);
        }
    }
    // Event handlers and functions
    onMount(() => {
        // mounted = true;
        clientActions.fetchClients();
    });

    function handleClientAdded() {
        showAddModal = false;
        currentPage = 1;
    }

    function changePage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
        }
    }

    function handleSort(column: keyof ClientsType) {
        if (sortColumn === column) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = column;
            sortAscending = true;
        }
    }

    function handleAddNewClient() {
        showAddModal = !showAddModal;
    }

    function toggleExportMenu() {
        showExportMenu = !showExportMenu;
    }

    function mapVerificationStatus(client: ClientsType): CustomerStatus {
        return client.admin_verification === 1 ? 'verified' : 'unverified';
    }

    const getStatusColor = (status: CustomerStatus) => ({
        verified: 'bg-[#86e49d] text-[#006b21]',
        unverified: 'bg-[#d893a3] text-[#b30021]'
    })[status];

    function handleView(clientId: number) {
        goto(`/private/all_clients/clients_details/${clientId}`);
    }

    function handleEmail(id: number) {
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

    // import { onMount } from 'svelte';

    // import AddCompanyModal from './AddNewClient.svelte';
    // import ExportMenu from './ExportMenu.svelte';
    // import { goto } from '$app/navigation';
    // import { clients, clientActions } from '$lib/services/client_services/client.store';
    // import type { ClientsType,CustomerStatus } from '$lib/services/client_services/client.type';
    // import { fade } from 'svelte/transition';
	// import AddNewClient from './AddNewClient.svelte';
    // // Sorting state
    // let sortColumn: keyof ClientsType | null = null;

    // let sortAscending: boolean = true;
    // export let searchQuery = '';
    // let showExportMenu = false;
    // let showEditModal = $state(false);
    // // Pagination
    // let currentPage = 1;
    // const itemsPerPage = 10;
    // let mounted = false;
    // // Fetch clients on component mount
    // onMount(() => {
    //     clientActions.fetchClients();
    // });
    // function handleClientAdded() {
    //     showAddModal = false;
    //     currentPage = 1;
    // }
    // // Filtered and sorted clients
    // $: filteredClients = searchQuery 
    //     ? $clients.filter(client => 
    //         client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         client.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         client.email.toLowerCase().includes(searchQuery.toLowerCase())
    //     )
    //     : $clients;
    
    // $: sortedClients = sortColumn 
    //     ? [...filteredClients].sort((a, b) => {
    //         const aValue = a[sortColumn as keyof ClientsType];
    //         const bValue = b[sortColumn as keyof ClientsType];
            
    //         if (typeof aValue === 'string' && typeof bValue === 'string') {
    //             return sortAscending 
    //                 ? aValue.localeCompare(bValue) 
    //                 : bValue.localeCompare(aValue);
    //         } else {
    //             return sortAscending 
    //                 ? (aValue as any) - (bValue as any) 
    //                 : (bValue as any) - (aValue as any);
    //         }
    //     })
    //     : filteredClients;
    
    // $: totalPages = Math.ceil(sortedClients.length / itemsPerPage);
    // $: paginatedClients = sortedClients.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // );

    // function changePage(page: number) {
    //     if (page >= 1 && page <= totalPages) {
    //         currentPage = page;
    //         // Only fetch from API if we're not filtering locally
    //         // if (!searchQuery) {
    //         //     clientActions.fetchClients();
    //         // }
    //     }
    // }
    
    // function handleSort(column: keyof ClientsType) {
    //     if (sortColumn === column) {
    //         sortAscending = !sortAscending;
    //     } else {
    //         sortColumn = column;
    //         sortAscending = true;
    //     }
    // }
    
    // let showAddModal = false;

    // function handleAddNewClient() {
    //     showAddModal = !showAddModal;
    // }

    // function toggleExportMenu() {
    //     showExportMenu = !showExportMenu;
    // }
    
    // // Map verification status to UI status
    // function mapVerificationStatus(client: ClientsType): CustomerStatus {
    //     return  client.admin_verification === 1 
    //         ? 'verified' 
    //         : 'unverified';
    // }
    
    // const getStatusColor = (status: CustomerStatus) => {
    //     const colors = {
    //         verified: 'bg-[#86e49d] text-[#006b21]',
    //         unverified: 'bg-[#d893a3] text-[#b30021]'
    //     };
    //     return colors[status];
    // };

    // function handleView(clientId: number) {
    //     goto(`/private/all_clients/clients_details/${clientId}`);
    // }

    // function handleEmail(id: number) {
    //     console.log('Email client:', id);
    // }
    
    // function handleEdit(clientId: number) {
    //     goto(`/private/all_clients/clients_details/${clientId}`);
    // }
    
    // // Format date for display
    // function formatDate(dateString: string): string {
    //     return new Date(dateString).toLocaleDateString('en-US', {
    //         year: 'numeric',
    //         month: 'short',
    //         day: 'numeric'
    //     });
    // }
</script>
<!-- {#if mounted} -->

<AddNewClient
showModal = {showEditModal}
existingClient = {client_detail}
on:close={()=> showEditModal = false}
on:clientAdded={()=>showEditModal = false}
/>
<div class="pt-4 ">
    <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
        <!-- <section class="w-full overflow-hidden"> -->
            <div class="pr-4 pb-4 flex justify-between items-center">
                <!-- Search input -->
                <div class="relative w-64">
        
                </div>
                
                <div class="flex gap-4">
                    <div class="relative">
                        {#if showExportMenu}
                            <ExportMenu customers={paginatedClients.map(client => ({
                                id: client.id,
                                companyName: client.company_name,
                                companyLocation: client.address || '',
                                dateJoined: formatDate(client.created_at),
                                verificationStatus: mapVerificationStatus(client),
                                numberOfAttendingCandidate: client.total_jobs_posted || 0,
                                companyImage: client.profile_picture || '/images/default-company.png'
                            }))} />
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
                        {#each paginatedClients as client}
                            <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                                <td class="p-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                            <img src={client.profile_picture !==null? API_CONFIG.IMAGE_URL +client.profile_picture : '/images/default.png'} 
                                                 alt={client.company_name} 
                                                 class="w-full h-full object-cover">
                                        </div>
                                        <span class="font-medium">{client.company_name}</span>
                                    </div>
                                </td>
                                <td class="p-4">{client.email}</td>
                                <td class="p-4">{client.address || 'N/A'}</td>
                                <td class="p-4">{formatDate(client.created_at)}</td>
                                <td class="p-4">{client.phone_number || 'N/A'}</td>
                                <td class="p-4 text-center">
                                    <span class="inline-block px-2 py-1 rounded-full text-xs font-medium {getStatusColor(mapVerificationStatus(client))}">
                                        {mapVerificationStatus(client).charAt(0).toUpperCase() + mapVerificationStatus(client).slice(1)}
                                    </span>
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center justify-left gap-2">
                                        <button
                                            class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                            on:click={() => selectedClient (client.id)}
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
            {#if totalPages > 0}
                <div class="flex items-center justify-between px-6 py-4 border-t">
                    <div class="text-sm text-gray-600">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedClients.length)} of {sortedClients.length} entries
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage === 1}
                            on:click={() => changePage(currentPage - 1)}
                        >
                            <span class="material-icons-sharp">chevron_left</span>
                        </button>
                        
                        {#each Array(totalPages) as _, i}
                            <button 
                                class="min-w-[32px] h-8 rounded-lg transition-colors {currentPage === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}"
                                on:click={() => changePage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        {/each}
                        
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentPage === totalPages}
                            on:click={() => changePage(currentPage + 1)}
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
        <!-- </section> -->
        
        <!-- </section> -->
    </main>
</div>
<svelte:window on:click={() => showExportMenu = false} />

<!-- {/if} -->