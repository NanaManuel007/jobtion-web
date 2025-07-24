
<script lang="ts">
    import { onMount } from 'svelte';
    import { reports, reportsPagination, isLoading, error, tsmActions } from '$lib/services/tsm_services/job.tsm.store';
    import type { InvoiceEntry } from '$lib/services/tsm_services/job.tsm.types';
    import Toast from '../general_components/Toast.svelte';
    import { TSMService } from '$lib/services/tsm_services/job.tsm.services';

    let { startDate, endDate, isInvoiceGenerated } = $state({
        startDate: '',
        endDate: '',
        isInvoiceGenerated: false // Default to false as specified
    });
    let showToast = $state(false);
	let toastMessage = $state('');
    let isGeneratingPayslip = $state(false);
    let hasExportedCSV = $state(false);
	let toastType = $state<'success' | 'error'>('success');
    let currentPage = $state(1);
    let pageSize = $state(10);

    // Update filteredReports to use InvoiceEntry structure
    let filteredReports = $derived(() => {
        if (!$reports) return [];
        
        return $reports.filter(entry => {
            if (!entry.slotStart) return false;
            
            const entryDate = new Date(entry.slotStart);
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Set hours to 0 for accurate date comparison
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            entryDate.setHours(0, 0, 0, 0);

            return entryDate >= start && entryDate <= end;
        });
    });

    // Add function to convert date to ISO format
    function convertToISODate(dateString: string): string {
        if (!dateString) return '';
        // Create date object and convert to ISO string
        const date = new Date(dateString + 'T00:00:00.000Z');
        return date.toISOString();
    }

    // Update filterByDate function
    async function filterByDate() {
        if (!startDate || !endDate) {
            toastMessage = 'Please select both start and end dates';
            toastType = 'error';
            showToast = true;
            return;
        }
        
        currentPage = 1; // Reset to first page when filtering
        await tsmActions.fetchReport({ 
            page: currentPage, 
            pageSize,
            fromDate: convertToISODate(startDate),
            toDate: convertToISODate(endDate),
            isInvoiceGeneratedToClient: isInvoiceGenerated
        });
    }

    // Update loadPage function
    async function loadPage(page: number) {
        currentPage = page;
        await tsmActions.fetchReport({ 
            page: currentPage, 
            pageSize,
            fromDate: startDate ? convertToISODate(startDate) : '',
            toDate: endDate ? convertToISODate(endDate) : '',
            isInvoiceGeneratedToClient: isInvoiceGenerated
        });
    }

    // Update changePageSize function
    async function changePageSize(newPageSize: number) {
        pageSize = newPageSize;
        currentPage = 1;
        await tsmActions.fetchReport({ 
            page: currentPage, 
            pageSize,
            fromDate: startDate ? convertToISODate(startDate) : '',
            toDate: endDate ? convertToISODate(endDate) : '',
            isInvoiceGeneratedToClient: isInvoiceGenerated
        });
    }

    // Single onMount function - remove the duplicate
    onMount(async () => {
        try {
            const success = await tsmActions.fetchReport({ 
                page: currentPage, 
                pageSize,
                fromDate: startDate ? convertToISODate(startDate) : '',
                toDate: endDate ? convertToISODate(endDate) : '',
                isInvoiceGeneratedToClient: isInvoiceGenerated
            });
            if (!success) {
                console.error('Failed to fetch report data');
            }
        } catch (err) {
            console.error('Error in onMount:', err);
        }
    });


    // Update onMount function
    onMount(async () => {
        try {
            const success = await tsmActions.fetchReport({ 
                page: currentPage, 
                pageSize,
                fromDate: startDate,
                toDate: endDate,
                isInvoiceGeneratedToClient: isInvoiceGenerated
            });
            if (!success) {
                console.error('Failed to fetch report data');
            }
        } catch (err) {
            console.error('Error in onMount:', err);
        }
    });

    // Update exportToCSV to use new InvoiceEntry structure
    // Update exportToCSV to use store's fetchReport method with InvoiceEntry structure
    async function exportToCSV() {
        if (!startDate || !endDate) {
            toastMessage = 'Please select both start and end dates';
            toastType = 'error';
            showToast = true;
            return;
        }
    
        try {
            // Use the store's fetchReport method with large page size and filter for non-invoiced records
            const success = await tsmActions.fetchReport({
                page: 1,
                pageSize: 10000, // Large page size to get all records
                fromDate: convertToISODate(startDate),
                toDate: convertToISODate(endDate),
                isInvoiceGeneratedToClient: false // Only fetch records where invoice is not generated
            });
    
            if (!success) {
                toastMessage = 'Failed to fetch report data';
                toastType = 'error';
                showToast = true;
                return;
            }
    
            // Get the current reports from the store
            const currentReports = reports;
            let reportData: InvoiceEntry[] = [];
            
            // Subscribe to get the current value
            const unsubscribe = currentReports.subscribe(value => {
                reportData = value;
            });
            unsubscribe();
    
            if (!reportData || reportData.length === 0) {
                toastMessage = 'No data available for export';
                toastType = 'error';
                showToast = true;
                return;
            }
    
            // Create CSV headers for InvoiceEntry structure
            const headers = [
                'Reference', 'Company', 'Address', 'Start Date', 'Candidate', 'Job Title',
                'Rate', 'Charge', 'Pay', 'Margin', 'Hours', 'Total', 'VAT', 'Payroll',
                'PO Number', 'Owner', 'Notes'
            ];
    
            // Map InvoiceEntry data to CSV format
            const csvData = reportData.map(entry => [
                entry.byOurRef || '',
                entry.companyName || '',
                entry.fullAddress || '',
                entry.slotStart || '',
                entry.tempName || '',
                entry.jobTitle || '',
                entry.rate?.toString() || '',
                entry.charge?.toString() || '',
                entry.tsPay?.toString() || '',
                entry.margin?.toString() || '',
                entry.totalHours?.toString() || '',
                entry.totalInvoice?.toString() || '',
                entry.vatAmount?.toString() || '',
                entry.payRollProvider || '',
                entry.poNumber || '',
                entry.owner || '',
                entry.notes || ''
            ]);
    
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
            link.setAttribute('download', `report_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
    
            toastMessage = 'Report exported successfully';
            toastType = 'success';
            showToast = true;
            hasExportedCSV = true;
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toastMessage = 'Failed to export report';
            toastType = 'error';
            showToast = true;
        }
    }
// wind breaker 
    //payslip 
    async function generatePayslip() {
        if (!startDate || !endDate) {
            toastMessage = 'Please select both start and end dates';
            toastType = 'error';
            showToast = true;
            return;
        }
        isGeneratingPayslip = true;
        try {
            const success = await TSMService.generatePayslip(
                convertToISODate(startDate),
                convertToISODate(endDate)
            );

            if (success) {
                toastMessage = 'Payslip generated successfully';
                toastType = 'success';
            } else {
                toastMessage = 'Failed to generate payslip';
                toastType = 'error';
            }
            showToast = true;
        } catch (error) {
            console.error('Error generating payslip:', error);
            toastMessage = 'Failed to generate payslip';
            toastType = 'error';
            showToast = true;
        } finally {
            isGeneratingPayslip = false;
        }
    }

               $effect(() => {
                    if (startDate && endDate) {
                        filterByDate();
                    }
                });
    // Toast
</script>
<div>
    {#if $isLoading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    {:else}

    <Toast 
        show={showToast}
        message={toastMessage}
        type={toastType}
    />
     
        <div class="overflow-x-auto shadow-sm rounded-lg">
            <!--date select -->
            <div class="bg-white p-4 border-b border-gray-200 flex gap-4 items-center">
                <div class="bg-white p-4 border-b border-gray-200 flex gap-4 items-center">
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
                    <div class="flex items-center gap-2">
                        <label for="invoiceGenerated" class="text-sm font-medium text-gray-700">Invoice Generated:</label>
                        <input
                            type="checkbox"
                            id="invoiceGenerated"
                            bind:checked={isInvoiceGenerated}
                            class="rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        on:click={filterByDate}
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Filter
                    </button>
                </div>
                <div class="flex gap-4">
                    <button
                    on:click={exportToCSV}
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                    Export to CSV
                </button>
                {#if hasExportedCSV}
                <button
                    on:click={generatePayslip}
                    class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isGeneratingPayslip}
                >
                    {#if isGeneratingPayslip}
                        <span class="inline-block animate-spin mr-2">⌛</span>
                    {/if}
                    Generate Payslip
                </button>
            {/if}
                </div>
        
     
                <!-- <button
                on:click={exportToCSV}
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                disabled={!filteredReports.length}
            >
                Export to CSV
            </button> -->
            </div>

            <!-- export as csv -->
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
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each $reports as entry}
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.byOurRef}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.companyName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.fullAddress}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.slotStart}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.tempName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.jobTitle}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.rate}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.charge}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.tsPay}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.margin}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.totalHours}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.totalInvoice}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.vatAmount}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.payRollProvider}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.poNumber || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.owner || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.notes || '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            
            <!-- Add pagination controls -->
            {#if $reportsPagination.totalPages > 1}
                <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div class="flex-1 flex justify-between sm:hidden">
                        <button
                            on:click={() => loadPage($reportsPagination.page - 1)}
                            disabled={$reportsPagination.page <= 1}
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            on:click={() => loadPage($reportsPagination.page + 1)}
                            disabled={$reportsPagination.page >= $reportsPagination.totalPages}
                            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm text-gray-700">
                                Showing
                                <span class="font-medium">{($reportsPagination.page - 1) * $reportsPagination.pageSize + 1}</span>
                                to
                                <span class="font-medium">{Math.min($reportsPagination.page * $reportsPagination.pageSize, $reportsPagination.totalCount)}</span>
                                of
                                <span class="font-medium">{$reportsPagination.totalCount}</span>
                                results
                            </p>
                        </div>
                        <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    on:click={() => loadPage($reportsPagination.page - 1)}
                                    disabled={$reportsPagination.page <= 1}
                                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {#each Array.from({length: Math.min($reportsPagination.totalPages, 10)}, (_, i) => i + 1) as page}
                                    {#if page === $reportsPagination.page}
                                        <span class="relative inline-flex items-center px-4 py-2 border border-purple-500 bg-purple-50 text-sm font-medium text-purple-600">
                                            {page}
                                        </span>
                                    {:else}
                                        <button
                                            on:click={() => loadPage(page)}
                                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            {page}
                                        </button>
                                    {/if}
                                {/each}
                                <button
                                    on:click={() => loadPage($reportsPagination.page + 1)}
                                    disabled={$reportsPagination.page >= $reportsPagination.totalPages}
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
    
