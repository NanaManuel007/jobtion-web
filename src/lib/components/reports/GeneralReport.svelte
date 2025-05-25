<!-- <script lang="ts">
    import { onMount } from 'svelte';
    import { reports, isLoading, error, tsmActions } from '$lib/services/tsm_services/job.tsm.store';
    // import { onMount } from 'svelte';

    let startDate = '';
    let endDate = '';
    let filteredReports:any = [];

    $: {
        if ($reports) {
            filteredReports = $reports.filter(entry => {
                if (!entry.SlotStart) return false;
                
                const entryDate = new Date(entry.SlotStart);
                const start = new Date(startDate);
                const end = new Date(endDate);

                // Set hours to 0 for accurate date comparison
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                entryDate.setHours(0, 0, 0, 0);

                return entryDate >= start && entryDate <= end;
            });
        }
    }
    onMount(async () => {
        try {
            const success = await tsmActions.fetchReport();
            if (!success) {
                console.error('Failed to fetch report data');
            }
        } catch (err) {
            console.error('Error in onMount:', err);
        }
    });

    function exportToCSV() {
        if (!filteredReports.length) return;

        // Define headers based on table structure
        const headers = [
            'Reference', 'Company', 'Address', 'Start Date', 'Candidate', 'Job Title',
            'Rate', 'Charge', 'Pay', 'Margin', 'Hours', 'Total', 'VAT', 'Payroll',
            'PO Number', 'Owner', 'Notes'
        ];

        // Map data to match headers
        const csvData = filteredReports.map((entry:any) => [
            entry.byOurRef,
            entry.CompanyName,
            entry.FullAddress,
            entry.SlotStart,
            entry.TempName,
            entry['Job title'],
            entry.Rate,
            entry.Charge,
            entry.TSPay,
            entry.Margin,
            entry.DecimalHours,
            entry.TotalInvoice,
            entry.PlusVat,
            entry.payroll_provider,
            entry.PONumber,
            entry.Owner,
            entry.Notes
        ]);

        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...csvData.map((row:any) => row.map((cell:any) => 
                cell ? `"${cell.toString().replace(/"/g, '""')}"` : '""'
            ).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script> -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { reports, isLoading, error, tsmActions } from '$lib/services/tsm_services/job.tsm.store';
	import type { TimesheetEntry } from '$lib/services/tsm_services/job.tsm.types';
	import Toast from '../general_components/Toast.svelte';

    let { startDate, endDate } = $state({
        startDate: '',
        endDate: ''
    });
    let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
    let filteredReports = $derived(() => {
        if (!$reports) return [];
        
        return $reports.filter(entry => {
            if (!entry.SlotStart) return false;
            
            const entryDate = new Date(entry.SlotStart);
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Set hours to 0 for accurate date comparison
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            entryDate.setHours(0, 0, 0, 0);

            return entryDate >= start && entryDate <= end;
        });
    });

    onMount(async () => {
        try {
            const success = await tsmActions.fetchReport();
            if (!success) {
                console.error('Failed to fetch report data');
            }
        } catch (err) {
            console.error('Error in onMount:', err);
        }
    });

    function exportToCSV() {
        console.log("clicked")
        const currentReports = filteredReports();
        if (!startDate && !endDate) {
            toastMessage = 'Please select both start and end dates';
            showToast = true;
            return;
        }

        if (!currentReports?.length) {
            console.error('No reports available to export');
            return;
        }

        try {
            // Define headers based on table structure
            const headers = [
                'Reference', 'Company', 'Address', 'Start Date', 'Candidate', 'Job Title',
                'Rate', 'Charge', 'Pay', 'Margin', 'Hours', 'Total', 'VAT', 'Payroll',
                'PO Number', 'Owner', 'Notes'
            ];

            // Map data to match headers
            const csvData = currentReports.map((entry) => [
                entry.byOurRef || '',
                entry.CompanyName || '',
                entry.FullAddress || '',
                entry.SlotStart || '',
                entry.TempName || '',
                entry['Job title'] || '',
                entry.Rate || '',
                entry.Charge || '',
                entry.TSPay || '',
                entry.Margin || '',
                entry.DecimalHours || '',
                entry.TotalInvoice || '',
                entry.PlusVat || '',
                entry.payroll_provider || '',
                entry.PONumber || '',
                entry.Owner || '',
                entry.Notes || ''
            ]);

            // Combine headers and data
            const csvContent = [
                headers.join(','),
                ...csvData.map((row) => row.map((cell) => 
                    `"${(cell || '').toString().replace(/"/g, '""')}"`
                ).join(','))
            ].join('\n');

            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `report_${startDate}_to_${endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Clean up the URL object

            console.log('CSV export completed successfully');
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    }
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
    type={"error"}
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
                </div>
                <button
                on:click={exportToCSV}
                class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
                Export to CSV
            </button>
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
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.CompanyName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.FullAddress}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.SlotStart}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.TempName}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry['Job title']}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.Rate}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.Charge}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.TSPay}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.Margin}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.DecimalHours}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.TotalInvoice}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.PlusVat}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.payroll_provider}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.PONumber || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.Owner}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.Notes || '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
    
