<script lang="ts">
    import { fade } from 'svelte/transition';
    import GeneralReport from './GeneralReport.svelte';
    import UserReport from './UserReport.svelte';
    import ClientReport from './ClientReport.svelte';
    
    type TabType = 'general' | 'user' | 'client';
    let activeTab: TabType = 'general';
    
    function setActiveTab(tab: TabType) {
        activeTab = tab;
    }
</script>

<div class="p-6 min-h-screen">
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Reports</h1>
        <p class="text-gray-600 mt-1">View and analyze system reports</p>
    </div>
    
    <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
                <button 
                    class="py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ease-out
                    {activeTab === 'general' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => setActiveTab('general')}
                    aria-selected={activeTab === 'general'}
                >
                    General Report
                </button>
                <button 
                    class="py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ease-out
                    {activeTab === 'user' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => setActiveTab('user')}
                    aria-selected={activeTab === 'user'}
                >
                    User Report
                </button>
                <button 
                    class="py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ease-out
                    {activeTab === 'client' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                    on:click={() => setActiveTab('client')}
                    aria-selected={activeTab === 'client'}
                >
                    Client Report
                </button>
            </nav>
        </div>
        
        <div class="p-6">
            {#if activeTab === 'general'}
                <div in:fade={{ duration: 200 }}>
                    <GeneralReport />
                </div>
            {:else if activeTab === 'user'}
                <div in:fade={{ duration: 200 }}>
                    <UserReport />
                </div>
            {:else if activeTab === 'client'}
                <div in:fade={{ duration: 200 }}>
                    <ClientReport />
                </div>
            {/if}
        </div>
    </div>
</div>