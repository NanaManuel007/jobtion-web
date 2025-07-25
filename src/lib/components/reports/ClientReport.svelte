<script lang="ts">
    import { onMount } from 'svelte';
    import { tsmActions, clientInvoices, clientInvoicesPagination, isLoadingClientInvoices, clientInvoicesError } from '$lib/services/tsm_services/job.tsm.store';
    import { API_CONFIG } from '$lib/services/api';
    // Remove this line: import type { ClientInvoiceGroup } from '$lib/services/client_services/client.type';
    import type { ClientInvoiceGroup } from '$lib/services/tsm_services/job.tsm.types';
    

    // State variables using Svelte 5 runes
    let currentPage = $state(1);
    let pageSize = $state(10);
    let startDate = $state('');
    let endDate = $state('');
    let showModal = $state(false);
    let selectedInvoiceGroup = $state<ClientInvoiceGroup | null>(null);

    // Derived computations
    let totalPages = $derived(Math.ceil($clientInvoicesPagination.totalCount / pageSize));
    let hasNextPage = $derived(currentPage < totalPages);
    let hasPrevPage = $derived(currentPage > 1);
    
    // Calculate totals
    let totalAmount = $derived($clientInvoices.reduce((sum, group) => sum + group.totalAmount, 0));
    let totalVAT = $derived($clientInvoices.reduce((sum, group) => sum + group.totalVAT, 0));
    let grandTotal = $derived($clientInvoices.reduce((sum, group) => sum + group.grandTotal, 0));
    let totalJobs = $derived($clientInvoices.reduce((sum, group) => sum + group.totalJobs, 0));

    // Functions
    function openModal(invoiceGroup: ClientInvoiceGroup) {
        selectedInvoiceGroup = invoiceGroup;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedInvoiceGroup = null;
    }

    function filterByDate() {
        currentPage = 1;
        fetchData();
    }

    function printModal() {
        const modalContent = document.querySelector('.fixed.inset-0.bg-black\\/50 .relative.top-20');
        if (!modalContent) {
            alert('Modal content not found. Please try again.');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Popup blocked. Please allow popups and try again.');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Client Invoice - ${selectedInvoiceGroup?.companyName || 'Invoice'}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 12mm;
                    }
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 11px;
                        line-height: 1.3;
                        color: #000;
                        background: white;
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                    }
                    .company-info {
                        flex: 1;
                    }
                    .invoice-title {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    .company-details {
                        font-size: 10px;
                        line-height: 1.3;
                    }
                    .client-info {
                        flex: 1;
                        text-align: right;
                    }
                    .logo {
                        font-size: 20px;
                        font-weight: bold;
                        color: #6B46C1;
                        margin-bottom: 8px;
                        display: flex;
                        justify-content: flex-end;
                    }
                    .logo img {
                        height: 50px;
                        width: auto;
                        max-width: 180px;
                    }
                    .invoice-details {
                        margin: 15px 0;
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 18px;
                    }
                    .invoice-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                        font-size: 10px;
                    }
                    .invoice-table th,
                    .invoice-table td {
                        border: 1px solid #000;
                        padding: 6px;
                        text-align: left;
                    }
                    .invoice-table th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                    }
                    .invoice-table td.number {
                        text-align: right;
                    }
                    .totals-section {
                        margin-top: 20px;
                        display: flex;
                        justify-content: flex-end;
                    }
                    .totals-table {
                        width: 280px;
                        font-size: 10px;
                    }
                    .totals-table td {
                        padding: 4px 10px;
                        border: none;
                    }
                    .totals-table .total-row {
                        font-weight: bold;
                        border-top: 2px solid #000;
                    }
                    .footer-info {
                        margin-top: 25px;
                        font-size: 9px;
                        border-top: 1px solid #ccc;
                        padding-top: 15px;
                    }
                    .payment-terms {
                        margin-top: 15px;
                    }
                    @media print {
                        body { print-color-adjust: exact; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                ${modalContent.innerHTML}
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Pagination functions
    function goToPage(page: number) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            fetchData();
        }
    }

    function nextPage() {
        if (hasNextPage) {
            currentPage++;
            fetchData();
        }
    }

    function prevPage() {
        if (hasPrevPage) {
            currentPage--;
            fetchData();
        }
    }

    async function fetchData() {
        const params = {
            pageNumber: currentPage,
            pageSize: pageSize,
            ...(startDate && { fromDate: startDate }),
            ...(endDate && { toDate: endDate })
        };
        
        await tsmActions.fetchClientInvoices(params);
    }

    // Initialize data on mount
    onMount(() => {
        fetchData();
    });
</script>

<div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">Client Invoice Report</h1>
                <p class="text-gray-600 mt-1">Manage and view client invoices</p>
            </div>
            <div class="flex items-center space-x-4">
                <span class="material-icons-sharp text-gray-400 text-3xl">business</span>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                    type="date"
                    id="startDate"
                    bind:value={startDate}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                    type="date"
                    id="endDate"
                    bind:value={endDate}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div class="flex items-end">
                <button
                    onclick={filterByDate}
                    class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Filter
                </button>
            </div>
            <div class="flex items-end">
                <button
                    onclick={() => window.print()}
                    class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <span class="material-icons-sharp text-sm">print</span>
                    <span>Print Report</span>
                </button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-blue-600">Total Amount</p>
                        <p class="text-2xl font-bold text-blue-900">£{totalAmount.toFixed(2)}</p>
                    </div>
                    <span class="material-icons-sharp text-blue-500 text-3xl">payments</span>
                </div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-green-600">Total VAT</p>
                        <p class="text-2xl font-bold text-green-900">£{totalVAT.toFixed(2)}</p>
                    </div>
                    <span class="material-icons-sharp text-green-500 text-3xl">receipt</span>
                </div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-purple-600">Grand Total</p>
                        <p class="text-2xl font-bold text-purple-900">£{grandTotal.toFixed(2)}</p>
                    </div>
                    <span class="material-icons-sharp text-purple-500 text-3xl">account_balance</span>
                </div>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-orange-600">Total Jobs</p>
                        <p class="text-2xl font-bold text-orange-900">{totalJobs}</p>
                    </div>
                    <span class="material-icons-sharp text-orange-500 text-3xl">work</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    {#if $isLoadingClientInvoices}
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading client invoices...</p>
        </div>
    {:else if $clientInvoicesError}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div class="flex items-center">
                <span class="material-icons-sharp text-red-500 mr-2">error</span>
                <p class="text-red-700">{$clientInvoicesError}</p>
            </div>
        </div>
    {:else if $clientInvoices.length === 0}
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
            <span class="material-icons-sharp text-gray-400 text-6xl mb-4">business</span>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No client invoices found</h3>
            <p class="text-gray-600">Try adjusting your date filters or check back later.</p>
        </div>
    {:else}
        <!-- Client Invoices List -->
        <div class="bg-white rounded-lg shadow-sm">
            <!-- Fixed Header -->
            <div class="p-6 border-b border-gray-200">
                <h2 class="text-lg font-semibold text-gray-900">Client Invoices ({$clientInvoicesPagination.totalCount})</h2>
            </div>
            
            <!-- Scrollable Content -->
            <div class="max-h-96 overflow-y-auto">
                <!-- Sticky List Header -->
                <div class="sticky top-0 bg-gray-50 px-6 py-3 border-b border-gray-200 grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                    <div>Company Name</div>
                    <div>Date</div>
                    <div class="text-right">Total Amount</div>
                    <div class="text-right">VAT</div>
                    <div class="text-right">Grand Total</div>
                    <div class="text-center">Actions</div>
                </div>
                
                <!-- Invoice Groups -->
                {#each $clientInvoices as invoiceGroup}
                    <div class="px-6 py-4 border-b border-gray-100 grid grid-cols-6 gap-4 items-center hover:bg-gray-50">
                        <div class="font-medium text-gray-900">{invoiceGroup.companyName}</div>
                        <div class="text-gray-600">{new Date(invoiceGroup.createdAtSameDateOrganization).toLocaleDateString()}</div>
                        <div class="text-right font-medium">£{invoiceGroup.totalAmount.toFixed(2)}</div>
                        <div class="text-right text-gray-600">£{invoiceGroup.totalVAT.toFixed(2)}</div>
                        <div class="text-right font-bold text-green-600">£{invoiceGroup.grandTotal.toFixed(2)}</div>
                        <div class="text-center">
                            <button
                                onclick={() => openModal(invoiceGroup)}
                                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                View Invoice
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
            
            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700">Show</span>
                    <select
                        bind:value={pageSize}
                        onchange={fetchData}
                        class="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span class="text-sm text-gray-700">entries</span>
                </div>
                
                <div class="flex items-center space-x-2">
                    <button
                        onclick={prevPage}
                        disabled={!hasPrevPage}
                        class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    
                    {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(totalPages, start + 4);
                        return start + i;
                    }).filter(page => page <= totalPages) as page}
                        <button
                            onclick={() => goToPage(page)}
                            class="px-3 py-1 border border-gray-300 rounded text-sm {currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}"
                        >
                            {page}
                        </button>
                    {/each}
                    
                    <button
                        onclick={nextPage}
                        disabled={!hasNextPage}
                        class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Invoice Modal -->
{#if showModal && selectedInvoiceGroup}
    <div class="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
        <div class="relative top-20 bg-white rounded-lg shadow-xl max-w-4xl w-full mb-20">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 no-print">
                <h3 class="text-lg font-semibold text-gray-900">Invoice - {selectedInvoiceGroup.companyName}</h3>
                <button
                    onclick={closeModal}
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span class="material-icons-sharp">close</span>
                </button>
            </div>
            
            <!-- Print Header -->
            <div class="print-only invoice-header">
                <div class="company-info">
                    <div class="invoice-title">INVOICE</div>
                    <div class="company-details">
                        Private and Confidential<br>
                        Bunny Tale Nursery<br>
                        France Chichester Way<br>
                        Ground Floor<br>
                        Falkirk<br>
                        Battersea<br>
                        SW11 5HX
                    </div>
                </div>
                <div class="client-info">
                    <div class="logo">
                        <img src="/images/quint_transparent.png" alt="Quint Education" style="height: 60px; width: auto; max-width: 200px;">
                    </div>
                    <div class="company-details">
                        Quint Education<br>
                        Unit 9, Spring Villa Park<br>
                        Spring Villa Road, Edgware<br>
                        London, HA8 7EB<br><br>
                        0207 11 88 098<br>
                        07940 745 987<br>
                        accounts@quinteducation.co.uk<br>
                        www.quinteducation.co.uk
                    </div>
                </div>
            </div>
            
            <!-- Invoice Details -->
            <div class="p-6">
                <!-- Print Invoice Details -->
                <div class="print-only invoice-details">
                    <div>
                        <strong>Document No:</strong> QE16580<br>
                        <strong>Document Date:</strong> {new Date(selectedInvoiceGroup.createdAtSameDateOrganization).toLocaleDateString('en-GB')}<br>
                        <strong>Customer ID:</strong> CLI8701<br>
                        <strong>Consultant:</strong> Maid Abeid<br>
                    </div>
                    <div>
                        <strong>Order Number:</strong><br>
                        <strong>Order Reference:</strong> France Chichester Way Ground Floor, Falkirk<br>
                        <strong>Week Ending:</strong> {new Date(selectedInvoiceGroup.createdAtSameDateOrganization).toLocaleDateString('en-GB')}<br>
                    </div>
                </div>
                
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 no-print">
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p class="text-sm font-medium text-blue-600">Total Amount</p>
                        <p class="text-xl font-bold text-blue-900">£{selectedInvoiceGroup.totalAmount.toFixed(2)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p class="text-sm font-medium text-green-600">VAT (20%)</p>
                        <p class="text-xl font-bold text-green-900">£{selectedInvoiceGroup.totalVAT.toFixed(2)}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p class="text-sm font-medium text-purple-600">Grand Total</p>
                        <p class="text-xl font-bold text-purple-900">£{selectedInvoiceGroup.grandTotal.toFixed(2)}</p>
                    </div>
                </div>
                
                <!-- Invoice Table -->
                <div class="overflow-x-auto">
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-right">Hours</th>
                                <th class="text-right">Charge</th>
                                <th class="text-right">Amount £</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each selectedInvoiceGroup.invoices as invoice}
                                <tr>
                                    <td>
                                        {invoice.tempName}<br>
                                        <span class="text-sm text-gray-600">{invoice.jobTitle}</span>
                                    </td>
                                    <td class="number">{invoice.totalHours.toFixed(2)}</td>
                                    <td class="number">£{invoice.charge.toFixed(2)}</td>
                                    <td class="number">£{invoice.totalInvoice.toFixed(2)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                
                <!-- Totals Section -->
                <div class="totals-section">
                    <table class="totals-table">
                        <tbody>
                            <tr>
                                <td><strong>Payment Terms:</strong></td>
                                <td class="text-right">14 Days</td>
                            </tr>
                            <tr>
                                <td><strong>Net Amount</strong></td>
                                <td class="text-right">£{selectedInvoiceGroup.totalAmount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td><strong>Payment Due:</strong></td>
                                <td class="text-right">{new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</td>
                            </tr>
                            <tr>
                                <td><strong>Vat @ 20%</strong></td>
                                <td class="text-right">£{selectedInvoiceGroup.totalVAT.toFixed(2)}</td>
                            </tr>
                            <tr class="total-row">
                                <td><strong>Total</strong></td>
                                <td class="text-right"><strong>£{selectedInvoiceGroup.grandTotal.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Print Footer -->
                <div class="print-only footer-info">
                    <div class="payment-terms">
                        <p><strong>Company UTR: 8734410784</strong></p>
                        <p><strong>Company Reg: 08847255</strong></p>
                        <div style="color: red; margin-top: 10px;">
                            <p>Please note that the benefit of this invoice has been assigned to</p>
                            <p>Capital Commercial Finance Ltd</p>
                            <p>Unit 10</p>
                            <p>Taurus Park, Westbrook, Warrington, WA5 5ZT</p>
                            <p>Tel: 01925 713 750</p>
                            <p>Account: 98444300 Sort Code: 60-12-31</p>
                            <p>Payment to any other party will not be sufficient to discharge</p>
                            <p>your liability to Capital Commercial Finance Ltd</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Print Button -->
            <div class="p-6 border-t border-gray-200 flex justify-end no-print">
                <button
                    onclick={printModal}
                    class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                    <span class="material-icons-sharp text-sm">print</span>
                    <span>Print PDF</span>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    @media print {
        body {
            background: white !important;
            color: black !important;
            font-size: 11px !important;
        }
        
        .no-print {
            display: none !important;
        }
        
        .print-only {
            display: block !important;
        }
        
        .invoice-header {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px !important;
            border-bottom: 2px solid #000 !important;
            padding-bottom: 15px !important;
        }
        
        .invoice-details {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 18px !important;
            margin: 15px 0 !important;
        }
        
        .invoice-table {
            border-collapse: collapse !important;
            font-size: 10px !important;
        }
        
        .invoice-table th,
        .invoice-table td {
            border: 1px solid #000 !important;
            padding: 6px !important;
        }
        
        .invoice-table th {
            background-color: #f5f5f5 !important;
        }
        
        .totals-section {
            display: flex !important;
            justify-content: flex-end !important;
            margin-top: 20px !important;
        }
        
        .footer-info {
            margin-top: 25px !important;
            font-size: 9px !important;
            border-top: 1px solid #ccc !important;
            padding-top: 15px !important;
        }
        
        @page {
            size: A4;
            margin: 12mm;
        }
    }
    
    .print-only {
        display: none;
    }
    
    .logo {
        display: flex;
        justify-content: flex-end;
    }
</style>