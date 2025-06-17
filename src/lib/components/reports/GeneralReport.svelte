
<script lang="ts">
    import { onMount } from 'svelte';
    import { reports, isLoading, error, tsmActions } from '$lib/services/tsm_services/job.tsm.store';
	import type { TimesheetEntry } from '$lib/services/tsm_services/job.tsm.types';
	import Toast from '../general_components/Toast.svelte';
	import { TSMService } from '$lib/services/tsm_services/job.tsm.services';

    let { startDate, endDate } = $state({
        startDate: '',
        endDate: ''
    });
    let showToast = $state(false);
	let toastMessage = $state('');
    let isGeneratingPayslip = $state(false);
    let hasExportedCSV = $state(false);
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
        if (!startDate || !endDate) {
            toastMessage = 'Please select both start and end dates';
            toastType = 'error';
            showToast = true;
            return;
        }

        try {
            TSMService.fetchReportSummary({
                start_date: startDate, 
                end_date: endDate   
            }).then(response => {
                // Create CSV from the response data
                const headers = [
                    'Reference', 'Company', 'Address', 'Start Date', 'Candidate', 'Job Title',
                    'Rate', 'Charge', 'Pay', 'Margin', 'Hours', 'Total', 'VAT', 'Payroll',
                    'PO Number', 'Owner', 'Notes'
                ];

                // const csvData = response.payrollRecords.map(record => [
                //     record.reference || '',
                //     record.company || '',
                //     record.address || '',
                //     record.startDate || '',
                //     record.candidate || '',
                //     record.jobTitle || '',
                //     record.rate || '',
                //     record.charge || '',
                //     record.pay || '',
                //     record.margin || '',
                //     record.hours || '',
                //     record.total || '',
                //     record.vat || '',
                //     record.payrollProvider || '',
                //     record.poNumber || '',
                //     record.owner || '',
                //     record.notes || ''
                // ]);
                    const csvData = response.data.payroll_records.map(record => [
                    record.OurRef || '',
                    record.CompanyName || '',
                    record.FullAddress || '',
                    record.SlotStart || '',
                    record['Temp Name'] || '',
                    record['Job title'] || '',
                    record[' Rate '] || '',
                    record[' Charge '] || '',
                    record[' TSPay '] || '',
                    record[' Margin '] || '',
                    record.DecimalHours || '',
                    record[' TotalInvoice '] || '',
                    record[' PlusVat '] || '',
                    record.payroll_provider || '',
                    record.PONumber || '',
                    record.Owner || '',
                    record.Notes || ''
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
            }).catch(error => {
                console.error('Error fetching report:', error);
                toastMessage = 'Failed to generate report';
                toastType = 'error';
                showToast = true;
            });
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
            const success = await TSMService.generatePayslip({
                start_date: startDate,
                end_date: endDate
            });

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
    
