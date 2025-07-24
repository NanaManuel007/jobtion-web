<script>
    import { onMount } from 'svelte';
    import { tsmActions, candidatePayslips, isLoadingPayslips, payslipsError, payslipsPagination } from '$lib/services/tsm_services/job.tsm.store';
    import { API_CONFIG } from '$lib/services/api';

    // State variables using $state for Svelte 5 runes mode
    let currentPage = $state(1);
    let pageSize = $state(10); // Reduced for better pagination
    let startDate = $state('');
    let endDate = $state('');
    let showModal = $state(false);
    let selectedCandidate = $state(null);

    // Derived values using $derived for Svelte 5
    const totalCandidates = $derived($candidatePayslips?.length || 0);
    const totalPayslips = $derived($candidatePayslips?.reduce((sum, candidate) => sum + candidate.payslipCount, 0) || 0);
    const totalHours = $derived($candidatePayslips?.reduce((sum, candidate) => sum + candidate.totalHours, 0) || 0);
    const totalNetPay = $derived($candidatePayslips?.reduce((sum, candidate) => sum + candidate.totalNetPay, 0) || 0);
    const totalGrossPay = $derived($candidatePayslips?.reduce((sum, candidate) => sum + candidate.totalGrossPay, 0) || 0);
    const totalTaxAmount = $derived($candidatePayslips?.reduce((sum, candidate) => sum + candidate.totalTaxAmount, 0) || 0);
    
    // Pagination derived values
    const totalPages = $derived(Math.ceil(($payslipsPagination?.totalCount || 0) / pageSize));
    const hasNextPage = $derived(currentPage < totalPages);
    const hasPrevPage = $derived(currentPage > 1);

    // Functions
    function openModal(candidate) {
        selectedCandidate = candidate;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedCandidate = null;
    }

    function filterByDate() {
        currentPage = 1; // Reset to first page when filtering
        fetchPayslips();
    }

    function fetchPayslips() {
        tsmActions.fetchCandidatePayslips({
            pageNumber: currentPage,
            pageSize: pageSize,
            fromDate: startDate,
            toDate: endDate
        });
    }

    function goToPage(page) {
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            fetchPayslips();
        }
    }

    function nextPage() {
        if (hasNextPage) {
            currentPage++;
            fetchPayslips();
        }
    }

    function prevPage() {
        if (hasPrevPage) {
            currentPage--;
            fetchPayslips();
        }
    }

    function printReport() {
        window.print();
    }

    function printModal() {
        // Get the modal content directly - escape the forward slash properly
        const modalContent = document.querySelector('.fixed.inset-0.bg-black\\/50 .relative.top-20');
        
        if (modalContent) {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                alert('Please allow popups to print the report');
                return;
            }
            
            // Get the modal content HTML
            const modalHTML = modalContent.innerHTML;
            
            // Create the print document
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Payslip Report - ${selectedCandidate.firstName} ${selectedCandidate.lastName}</title>
                    <meta charset="utf-8">
                    <style>
                        @page {
                            size: A4;
                            margin: 0.5in;
                        }
                        
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.4;
                            color: black;
                            background: white;
                            margin: 0;
                            padding: 20px;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            border: 2px solid black;
                            margin: 20px 0;
                        }
                        
                        th, td {
                            border: 1px solid black;
                            padding: 8px;
                            text-align: left;
                        }
                        
                        th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                        }
                        
                        .grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            margin-bottom: 20px;
                        }
                        
                        .summary-card {
                            border: 2px solid black;
                            padding: 15px;
                            background: white;
                        }
                        
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        .text-2xl { font-size: 1.5rem; }
                        .text-3xl { font-size: 1.875rem; }
                        .text-4xl { font-size: 2.25rem; }
                        .mb-2 { margin-bottom: 0.5rem; }
                        .mb-6 { margin-bottom: 1.5rem; }
                        .mb-8 { margin-bottom: 2rem; }
                        .mt-4 { margin-top: 1rem; }
                        .mt-8 { margin-top: 2rem; }
                        .pt-4 { padding-top: 1rem; }
                        .pb-6 { padding-bottom: 1.5rem; }
                        .border-t-2 { border-top: 2px solid black; }
                        .border-b-2 { border-bottom: 2px solid black; }
                        
                        .flex {
                            display: flex;
                        }
                        
                        .justify-between {
                            justify-content: space-between;
                        }
                        
                        .items-center {
                            align-items: center;
                        }
                        
                        .space-x-4 > * + * {
                            margin-left: 1rem;
                        }
                        
                        img {
                            width: 80px;
                            height: 80px;
                            border-radius: 50%;
                            border: 1px solid black;
                        }
                        
                        /* Override Tailwind classes for print */
                        .print\\:block { display: block !important; }
                        .print\\:text-center { text-align: center !important; }
                        .print\\:mb-6 { margin-bottom: 1.5rem !important; }
                        .print\\:mt-4 { margin-top: 1rem !important; }
                        .print\\:mt-8 { margin-top: 2rem !important; }
                        .print\\:text-4xl { font-size: 2.25rem !important; }
                        .print\\:text-lg { font-size: 1.125rem !important; }
                        .print\\:text-black { color: black !important; }
                        .print\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
                        .print\\:gap-6 { gap: 1.5rem !important; }
                        .print\\:bg-white { background-color: white !important; }
                        .print\\:border-2 { border-width: 2px !important; }
                        .print\\:border-black { border-color: black !important; }
                        .print\\:rounded-none { border-radius: 0 !important; }
                        .print\\:p-6 { padding: 1.5rem !important; }
                        .print\\:text-2xl { font-size: 1.5rem !important; }
                        .print\\:font-bold { font-weight: bold !important; }
                        .print\\:border { border-width: 1px !important; }
                        .print\\:px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
                        .print\\:py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
                        .print\\:pt-4 { padding-top: 1rem !important; }
                        .print\\:border-t-2 { border-top: 2px solid black !important; }
                        
                        /* Hide elements that shouldn't print */
                        .hidden { display: none; }
                        .print\\:block.hidden { display: block !important; }
                    </style>
                </head>
                <body>
                    ${modalHTML}
                </body>
                </html>
            `);
            
            printWindow.document.close();
            
            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            console.error('Modal content not found');
            alert('Unable to find modal content for printing');
        }
    }
    onMount(async () => {
        await tsmActions.fetchCandidatePayslips({
            pageNumber: currentPage,
            pageSize: pageSize
        });
    });
</script>

<style>
    @media print {
        .no-print {
            display: none !important;
        }
        .print-content {
            page-break-inside: avoid;
        }
        
        /* Print-specific styles */
        @page {
            margin: 1in;
            size: A4;
        }
        
        body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }
        
        /* Ensure table doesn't break across pages */
        table {
            page-break-inside: auto;
        }
        
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        /* Force black text and borders for better print quality */
        .print\:text-black {
            color: black !important;
        }
        
        .print\:border-black {
            border-color: black !important;
        }
        
        .print\:bg-white {
            background-color: white !important;
        }
        
        /* Hide modal overlay for print */
        .print\:relative {
            position: relative !important;
        }
        
        .print\:top-0 {
            top: 0 !important;
        }
        
        .print\:mx-0 {
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        
        .print\:max-w-none {
            max-width: none !important;
        }
        
        .print\:w-full {
            width: 100% !important;
        }
        
        .print\:shadow-none {
            box-shadow: none !important;
        }
        
        .print\:border-none {
            border: none !important;
        }
    }
</style>

<div class="p-6">
    <!-- Header -->
    <div class="mb-6 no-print">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">Candidate Payslips Report</h2>
                <p class="text-gray-600">View and manage candidate payslip information</p>
            </div>

        </div>
    </div>

    <!-- Date Filter Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 no-print">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Filter Options</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                </label>
                <input
                    type="date"
                    id="startDate"
                    bind:value={startDate}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                </label>
                <input
                    type="date"
                    id="endDate"
                    bind:value={endDate}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Page Size
                </label>
                <select
                    bind:value={pageSize}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                </select>
            </div>
            <div>
                <button
                    on:click={filterByDate}
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Apply Filter
                </button>
            </div>
        </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print-content">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Candidates</p>
                    <p class="text-2xl font-bold text-gray-900">{totalCandidates}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Payslips</p>
                    <p class="text-2xl font-bold text-gray-900">{totalPayslips}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Hours</p>
                    <p class="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Total Net Pay</p>
                    <p class="text-2xl font-bold text-gray-900">£{totalNetPay.toFixed(2)}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Loading State -->
    {#if $isLoadingPayslips}
        <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Loading payslips...</span>
        </div>
    {:else if !$candidatePayslips || $candidatePayslips.length === 0}
        <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-700 mb-2">No Payslips Found</h3>
            <p class="text-gray-500">No candidate payslips match your current filters.</p>
        </div>
    {:else}
        <!-- Candidates List with Fixed Height and Scroll -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Candidates</h3>
                        <p class="text-gray-600 text-sm mt-1">Click on any candidate to view their payslip details</p>
                    </div>
                    <div class="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, $payslipsPagination?.totalCount || 0)} of {$payslipsPagination?.totalCount || 0}
                    </div>
                </div>
            </div>
            
            <!-- Scrollable Content Area -->
            <div class="max-h-96 overflow-y-auto">
                <div class="divide-y divide-gray-200">
                    {#each $candidatePayslips as candidate}
                        <button
                            class="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150"
                            on:click={() => openModal(candidate)}
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <img 
                                        src={API_CONFIG.IMAGE_URL + candidate.profilePictureUrl || '/images/default.png'} 
                                        alt="{candidate.firstName} {candidate.lastName}"
                                        class="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                    />
                                    <div>
                                        <h4 class="text-lg font-medium text-gray-900">{candidate.firstName} {candidate.lastName}</h4>
                                        <p class="text-sm text-gray-500">ID: {candidate.candidateId}</p>
                                        <p class="text-sm text-gray-500">{candidate.payslipCount} payslip{candidate.payslipCount !== 1 ? 's' : ''} • {candidate.totalHours} hours</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-lg font-semibold text-green-600">£{candidate.totalNetPay.toFixed(2)}</div>
                                    <div class="text-sm text-gray-500">Net Pay</div>
                                </div>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Pagination Controls -->
            <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <select
                            bind:value={pageSize}
                            on:change={() => { currentPage = 1; fetchPayslips(); }}
                            class="ml-4 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button
                            on:click={prevPage}
                            disabled={!hasPrevPage}
                            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Previous
                        </button>
                        
                        <!-- Page Numbers -->
                        <div class="flex space-x-1">
                            {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                const startPage = Math.max(1, currentPage - 2);
                                const endPage = Math.min(totalPages, startPage + 4);
                                return startPage + i;
                            }).filter(page => page <= totalPages) as page}
                                <button
                                    on:click={() => goToPage(page)}
                                    class="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-100'}"
                                >
                                    {page}
                                </button>
                            {/each}
                        </div>
                        
                        <button
                            on:click={nextPage}
                            disabled={!hasNextPage}
                            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<!-- Modal -->
{#if showModal && selectedCandidate}
    <div class="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50 no-print" on:click={closeModal}>
        <div class="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white print:shadow-none print:border-none print:max-w-none print:w-full print:top-0 print:relative print:mx-0" on:click|stopPropagation>
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-4 border-b border-gray-200 print:border-b-2 print:border-black print:pb-6">
                <div class="flex items-center space-x-4">
                    <img 
                        src={API_CONFIG.IMAGE_URL + selectedCandidate.profilePictureUrl || '/images/default.png'} 
                        alt="{selectedCandidate.firstName} {selectedCandidate.lastName}"
                        class="w-16 h-16 rounded-full object-cover border-2 border-gray-200 print:border-black print:w-20 print:h-20"
                    />
                    <div>
                        <h3 class="text-2xl font-bold text-gray-900 print:text-black print:text-3xl">{selectedCandidate.firstName} {selectedCandidate.lastName}</h3>
                        <p class="text-gray-600 print:text-black print:text-lg">Candidate ID: {selectedCandidate.candidateId}</p>
                        <p class="text-sm text-gray-500 print:text-black print:text-base">Completed: {new Date(selectedCandidate.completedDate).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600 print:text-black print:text-3xl">£{selectedCandidate.totalNetPay.toFixed(2)}</div>
                        <div class="text-sm text-gray-500 print:text-black print:text-base">{selectedCandidate.payslipCount} payslips • {selectedCandidate.totalHours} hours</div>
                    </div>
                    <button 
                        class="text-gray-400 hover:text-gray-600 text-2xl font-bold no-print"
                        on:click={closeModal}
                    >
                        ×
                    </button>
                </div>
            </div>

            <!-- Print Header (only visible when printing) -->
            <div class="hidden print:block print:text-center print:mb-6 print:mt-4">
                <h1 class="text-4xl font-bold text-black mb-2">Payslip Report</h1>
                <p class="text-lg text-black">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            <!-- Modal Content -->
            <div class="mt-6 print:mt-8">
                <!-- Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3 print:gap-6 print:mb-8">
                    <div class="bg-blue-50 p-4 rounded-lg print:bg-white print:border-2 print:border-black print:rounded-none print:p-6">
                        <h4 class="text-sm font-medium text-blue-800 mb-2 print:text-black print:text-lg print:font-bold">Total Gross Pay</h4>
                        <p class="text-xl font-bold text-blue-900 print:text-black print:text-2xl">£{selectedCandidate.totalGrossPay.toFixed(2)}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg print:bg-white print:border-2 print:border-black print:rounded-none print:p-6">
                        <h4 class="text-sm font-medium text-red-800 mb-2 print:text-black print:text-lg print:font-bold">Total Tax</h4>
                        <p class="text-xl font-bold text-red-900 print:text-black print:text-2xl">£{selectedCandidate.totalTaxAmount.toFixed(2)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg print:bg-white print:border-2 print:border-black print:rounded-none print:p-6">
                        <h4 class="text-sm font-medium text-green-800 mb-2 print:text-black print:text-lg print:font-bold">Total Net Pay</h4>
                        <p class="text-xl font-bold text-green-900 print:text-black print:text-2xl">£{selectedCandidate.totalNetPay.toFixed(2)}</p>
                    </div>
                </div>

                <!-- Payslips Table -->
                <div class="overflow-x-auto print:overflow-visible">
                    <table class="min-w-full divide-y divide-gray-200 print:divide-black print:border-2 print:border-black">
                        <thead class="bg-gray-50 print:bg-white">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Reference</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Company</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Position</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Week Ending</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Hours</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Rate</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Gross Pay</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Tax</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:text-black print:text-sm print:font-bold print:border print:border-black print:px-4 print:py-3">Net Pay</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200 print:divide-black">
                            {#each selectedCandidate.payslips as payslip}
                                <tr class="hover:bg-gray-50 print:hover:bg-white">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">{payslip.payslipReference}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">{payslip.companyNames}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">{payslip.jobTitles}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">{new Date(payslip.weekEnding).toLocaleDateString()}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">{payslip.totalHours}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">£{payslip.rate.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:text-black print:border print:border-black print:px-4 print:py-3">£{payslip.grossPay.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 print:text-black print:border print:border-black print:px-4 print:py-3">£{payslip.taxAmount.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 print:text-black print:font-bold print:border print:border-black print:px-4 print:py-3">£{payslip.netPay.toFixed(2)}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>

                <!-- Print Footer -->
                <div class="hidden print:block print:mt-8 print:pt-4 print:border-t-2 print:border-black">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm text-black">Report generated by Jobtion Admin System</p>
                            <p class="text-sm text-black">Date: {new Date().toLocaleDateString()} | Time: {new Date().toLocaleTimeString()}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold text-black">Total Net Pay: £{selectedCandidate.totalNetPay.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <!-- Print Button -->
                <div class="mt-6 text-center no-print">
                    <button 
                        on:click={printModal}
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 mx-auto"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                        Print PDF
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}