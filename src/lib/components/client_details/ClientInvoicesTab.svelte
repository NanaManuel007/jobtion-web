<script lang="ts">
    import { onMount } from 'svelte';
    import { clientInvoices, invoicesLoading, invoicesTotalCount, invoicesCurrentPage, invoicesPageSize, clientActions } from '$lib/services/client_services/client.store';
    import type { SelectedClientType, ClientInvoicesRequest } from '$lib/services/client_services/client.type';
    import Toast from '../general_components/Toast.svelte';

     let { client }: { client: SelectedClientType } = $props();

    let { startDate, endDate } = $state({
        startDate: '',
        endDate: ''
    });
    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let currentPage = $state(1);
    let pageSize = $state(10);

    // Reactive parameters for API calls
    let invoiceParams = $derived({
        clientId: client.id,
        pageNumber: currentPage,
        pageSize: pageSize,
        ...(startDate && { fromDate: startDate }),
        ...(endDate && { toDate: endDate })
    } as ClientInvoicesRequest);

    // Replace $: with $effect for side effects
    $effect(() => {
        if (client.id) {
            fetchInvoices();
        }
    });

    async function fetchInvoices() {
        try {
            await clientActions.getClientInvoices(invoiceParams);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            toastMessage = 'Failed to load invoices';
            toastType = 'error';
            showToast = true;
        }
    }

    function exportToCSV() {
        if (!startDate || !endDate) {
            toastMessage = 'Please select both start and end dates';
            toastType = 'error';
            showToast = true;
            return;
        }

        try {
            const headers = [
                'Reference', 'Company', 'Address', 'Start Date', 'Candidate', 'Job Title',
                'Rate', 'Charge', 'Pay', 'Margin', 'Hours', 'Total', 'VAT', 'Payroll',
                'PO Number', 'Owner', 'Notes', 'Client Paid', 'Admin Received'
            ];

            const csvData: string[][] = [];
            $clientInvoices.forEach(group => {
                group.invoices.forEach(invoice => {
                    csvData.push([
                        invoice.byOurRef || '',
                        invoice.companyName || '',
                        invoice.fullAddress || '',
                        invoice.slotStart || '',
                        invoice.tempName || '',
                        invoice.jobTitle || '',
                        invoice.rate?.toString() || '',
                        invoice.charge?.toString() || '',
                        invoice.tsPay?.toString() || '',
                        invoice.margin?.toString() || '',
                        invoice.totalHours?.toString() || '',
                        invoice.totalInvoice?.toString() || '',
                        invoice.vatAmount?.toString() || '',
                        invoice.payRollProvider || '',
                        invoice.poNumber || '',
                        invoice.owner || '',
                        invoice.notes || '',
                        invoice.isClientPaid ? 'Yes' : 'No',
                        invoice.isAdminReceivedPayment ? 'Yes' : 'No'
                    ]);
                });
            });

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => 
                    `"${(cell || '').toString().replace(/"/g, '""')}"`
                ).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${client.data.companyName}_invoices_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toastMessage = 'Invoices exported successfully';
            toastType = 'success';
            showToast = true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toastMessage = 'Failed to export invoices';
            toastType = 'error';
            showToast = true;
        }
    }

    function changePage(newPage: number) {
        currentPage = newPage;
    }

    onMount(() => {
        fetchInvoices();
    });
</script>

<div>
    <Toast 
        show={showToast}
        message={toastMessage}
        type={toastType}
    />

    {#if $invoicesLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    {:else}
        <div class="overflow-x-auto shadow-sm rounded-lg">
            <!-- Date filters and export -->
            <div class="bg-white p-4 border-b border-gray-200 flex gap-4 items-center justify-between">
                <div class="flex gap-4 items-center">
                    <div class="flex items-center gap-2">
                        <label for="startDate" class="text-sm font-medium text-gray-700">From:</label>
                        <input
                            type="date"
                            id="startDate"
                            bind:value={startDate}
                            class="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <label for="endDate" class="text-sm font-medium text-gray-700">To:</label>
                        <input
                            type="date"
                            id="endDate"
                            bind:value={endDate}
                            class="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                    </div>
                </div>
                <button
                    on:click={exportToCSV}
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                    Export to CSV
                </button>
            </div>

            <!-- Invoices table -->
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each $clientInvoices as group}
                        {#each group.invoices as invoice}
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.byOurRef}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.companyName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.fullAddress}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.slotStart}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.tempName}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.jobTitle}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.rate}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.charge}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.tsPay}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.margin}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.totalHours}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.totalInvoice}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">£{invoice.vatAmount}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.payRollProvider}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.poNumber || '-'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.owner}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <div class="flex gap-2">
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {invoice.isClientPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                            {invoice.isClientPaid ? 'Paid' : 'Unpaid'}
                                        </span>
                                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {invoice.isAdminReceivedPayment ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                                            {invoice.isAdminReceivedPayment ? 'Received' : 'Pending'}
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    {/each}
                </tbody>
            </table>

            <!-- Pagination -->
            {#if $invoicesTotalCount > pageSize}
                <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div class="flex-1 flex justify-between sm:hidden">
                        <button
                            on:click={() => changePage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            on:click={() => changePage(currentPage + 1)}
                            disabled={currentPage >= Math.ceil($invoicesTotalCount / pageSize)}
                            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm text-gray-700">
                                Showing
                                <span class="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                                to
                                <span class="font-medium">{Math.min(currentPage * pageSize, $invoicesTotalCount)}</span>
                                of
                                <span class="font-medium">{$invoicesTotalCount}</span>
                                results
                            </p>
                        </div>
                        <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    on:click={() => changePage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {#each Array(Math.ceil($invoicesTotalCount / pageSize)) as _, i}
                                    <button
                                        on:click={() => changePage(i + 1)}
                                        class="relative inline-flex items-center px-4 py-2 border text-sm font-medium {currentPage === i + 1 ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}"
                                    >
                                        {i + 1}
                                    </button>
                                {/each}
                                <button
                                    on:click={() => changePage(currentPage + 1)}
                                    disabled={currentPage >= Math.ceil($invoicesTotalCount / pageSize)}
                                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</div>