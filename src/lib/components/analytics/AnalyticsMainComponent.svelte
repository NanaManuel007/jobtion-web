<script lang="ts">
    import { onMount } from 'svelte';
    import CompanySelector from './clients_analytics/CompanySelector.svelte';
    import OverviewCards from './clients_analytics/OverviewCards.svelte';
    import JobsAnalytics from './clients_analytics/JobAnalytics.svelte';
    import FinancialMetrics from './clients_analytics/FinancialMetrics.svelte';
    import UserMetrics from './clients_analytics/UserMetrics.svelte';
    import TimeSeriesChart from './clients_analytics/TimeSeriesChart.svelte';
    import { fade, fly } from 'svelte/transition';
    
    // Mock data - replace with actual API calls
    type Company = {
        id: number;
        name: string;
        logo: string;
    };
    let companies:Company[] = [];
    let selectedCompany:Company | null = null;
    let isLoading = true;
    type TimeRange = 'week' | 'month' | 'quarter' | 'year';
    
    let timeRange: TimeRange = 'month';
    
    onMount(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        companies = [
            { id: 1, name: 'Acme Corporation', logo: 'https://via.placeholder.com/40' },
            { id: 2, name: 'Globex Industries', logo: 'https://via.placeholder.com/40' },
            { id: 3, name: 'Stark Enterprises', logo: 'https://via.placeholder.com/40' },
            { id: 4, name: 'Wayne Industries', logo: 'https://via.placeholder.com/40' },
            { id: 5, name: 'Umbrella Corp', logo: 'https://via.placeholder.com/40' }
        ];
        selectedCompany = companies[0];
        isLoading = false;
    });
    

    function handleCompanyChange(event: CustomEvent<Company>) {
    selectedCompany = event.detail;
    // Force update by creating new reference
    companies = [...companies];
    // Fetch new data for selected company
}  
    function handleTimeRangeChange(range:TimeRange) {
        timeRange = range;
        // Refresh data for new time range
    }
</script>

<div class="p-6 min-h-screen">
    {#if isLoading}
    <div class="flex flex-col justify-center items-center h-64" in:fade={{ duration: 300 }}>
        <div class="relative w-24 h-24">
            <div class="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75"></div>
            <div class="absolute top-1 left-1 right-1 bottom-1 bg-white rounded-full"></div>
            <div class="absolute top-3 left-3 right-3 bottom-3 animate-spin">
                <div class="h-full w-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
        </div>
        <p class="mt-4 text-gray-600 font-medium animate-pulse">Loading analytics data...</p>
    </div>
{:else}
        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 400 }}>
            <h1 class="text-2xl font-bold text-gray-800">Analytics </h1>
            <div class="flex gap-4 items-center">
                <div class="flex space-x-2">
                    <button 
                        class="px-3 py-1.5 rounded-md text-sm font-medium {timeRange === 'week' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        on:click={() => handleTimeRangeChange('week')}
                    >
                        Week
                    </button>
                    <button 
                        class="px-3 py-1.5 rounded-md text-sm font-medium {timeRange === 'month' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        on:click={() => handleTimeRangeChange('month')}
                    >
                        Month
                    </button>
                    <button 
                        class="px-3 py-1.5 rounded-md text-sm font-medium {timeRange === 'quarter' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        on:click={() => handleTimeRangeChange('quarter')}
                    >
                        Quarter
                    </button>
                    <button 
                        class="px-3 py-1.5 rounded-md text-sm font-medium {timeRange === 'year' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                        on:click={() => handleTimeRangeChange('year')}
                    >
                        Year
                    </button>
                </div>
                <CompanySelector 
                companies={companies} 
                bind:selectedCompany
                on:change={handleCompanyChange} 
            />
            </div>
        </div>
        
        <div in:fly={{ y: 20, duration: 500, delay: 200 }}>
            <OverviewCards company={selectedCompany} {timeRange} />
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div in:fly={{ x: -20, duration: 500, delay: 300 }}>
                <JobsAnalytics company={selectedCompany} {timeRange} />
            </div>
            <div in:fly={{ x: 20, duration: 500, delay: 300 }}>
                <FinancialMetrics company={selectedCompany} {timeRange} />
            </div>
        </div>
        
        <div class="mt-6" in:fly={{ y: 20, duration: 500, delay: 400 }}>
            <TimeSeriesChart company={selectedCompany} {timeRange} />
        </div>
        
        <div class="mt-6" in:fly={{ y: 20, duration: 500, delay: 500 }}>
            <UserMetrics company={selectedCompany} {timeRange} />
        </div>
    {/if}
</div>