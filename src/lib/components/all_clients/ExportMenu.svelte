<script lang="ts">
    import type { ClientsType } from '$lib/services/client_services/client.type';
    
    export let customers: ClientsType[];
    
    function exportToPDF() {
        console.log('Exporting to PDF...');
    }

    function exportToJSON() {
        const data = JSON.stringify(customers, null, 2);
        downloadFile(data, 'customers.json', 'application/json');
    }

    function exportToCSV() {
        const headers = ['id', 'companyName', 'address', 'createdAt', 'adminVerification', 'totalJobsPosted'];
        const csvData = customers.map(customer => 
            headers.map(header => customer[header as keyof ClientsType]).join(',')
        );
        const csv = [headers.join(','), ...csvData].join('\n');
        downloadFile(csv, 'customers.csv', 'text/csv');
    }

    function downloadFile(content: string, fileName: string, contentType: string) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    }
</script>

<div class="relative group">
    <button 
        aria-label="Export menu"
        class="w-8 h-8 bg-white/40 rounded-full bg-[url('/images/export.png')] bg-center bg-no-repeat bg-[length:80%] transition-transform duration-200 hover:bg-white hover:scale-110"
    ></button>
    <div class="absolute right-0 w-48 rounded-lg overflow-hidden text-center opacity-0 scale-90 origin-top-right shadow-md transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 z-50 bg-white">
        <div class="w-full p-4 bg-[#86e49d] hover:bg-[rgba(132,139,200,0.18)] text-center flex justify-around items-center transition-colors duration-300">
            Export As &#10140;
        </div>
        <button on:click={exportToPDF} class="w-full py-2 bg-gray-100 flex justify-around items-center hover:scale-105 hover:bg-white transition-all duration-200">
            PDF <img src="/images/pdf.png" alt="PDF" class="w-8 h-auto">
        </button>
        <button on:click={exportToJSON} class="w-full py-2 bg-gray-100 flex justify-around items-center hover:scale-105 hover:bg-white transition-all duration-200">
            JSON <img src="/images/json.png" alt="JSON" class="w-8 h-auto">
        </button>
        <button on:click={exportToCSV} class="w-full py-2 bg-gray-100 flex justify-around items-center hover:scale-105 hover:bg-white transition-all duration-200">
            CSV <img src="/images/csv.png" alt="CSV" class="w-8 h-auto">
        </button>
    </div>
</div>