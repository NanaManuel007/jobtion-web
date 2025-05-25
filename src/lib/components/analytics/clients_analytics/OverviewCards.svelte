<script lang="ts">
    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    
    export let company: any;
    export let timeRange: string;
    
    const tweenOptions = { duration: 1000, easing: cubicOut };
    
    // Create individual stores
    const totalJobs = tweened(0, tweenOptions);
    const acceptedJobs = tweened(0, tweenOptions);
    const totalRevenue = tweened(0, tweenOptions);
    const activeUsers = tweened(0, tweenOptions);
    
    interface PercentChanges {
        totalJobs: number;
        acceptedJobs: number;
        totalRevenue: number;
        activeUsers: number;
    }
    
    let percentChanges: PercentChanges = {
        totalJobs: 0,
        acceptedJobs: 0,
        totalRevenue: 0,
        activeUsers: 0
    };
    
    $: if (company && timeRange) {
        loadData();
    }
    
    async function loadData() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newData = {
            totalJobs: Math.floor(Math.random() * 500) + 100,
            acceptedJobs: Math.floor(Math.random() * 300) + 50,
            totalRevenue: Math.floor(Math.random() * 50000) + 10000,
            activeUsers: Math.floor(Math.random() * 1000) + 200
        };
        
        totalJobs.set(newData.totalJobs);
        acceptedJobs.set(newData.acceptedJobs);
        totalRevenue.set(newData.totalRevenue);
        activeUsers.set(newData.activeUsers);
        
        percentChanges = {
            totalJobs: Math.floor(Math.random() * 30) - 10,
            acceptedJobs: Math.floor(Math.random() * 30) - 10,
            totalRevenue: Math.floor(Math.random() * 30) - 10,
            activeUsers: Math.floor(Math.random() * 30) - 10
        };
    }
    
    onMount(() => {
        if (company) loadData();
    });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Jobs Card -->
    <div class="bg-white rounded-xl shadow-[0_1rem_4rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-sm font-medium text-gray-500">Total Jobs</p>
                <h3 class="text-2xl font-bold mt-1">{$totalJobs.toFixed(0)}</h3>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg">
                <span class="material-icons-sharp text-blue-500">work</span>
            </div>
        </div>
        <div class="mt-4 flex items-center">
            <span class={`text-sm font-medium ${percentChanges.totalJobs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentChanges.totalJobs >= 0 ? '+' : ''}{percentChanges.totalJobs}%
            </span>
            <span class="text-xs text-gray-500 ml-2">vs previous {timeRange}</span>
        </div>
    </div>
    
    <!-- Accepted Jobs Card -->
    <div class="bg-white rounded-xl shadow-[0_1rem_4rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-sm font-medium text-gray-500">Accepted Jobs</p>
                <h3 class="text-2xl font-bold mt-1">{Math.round($acceptedJobs)}</h3>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
                <span class="material-icons-sharp text-green-500">check_circle</span>
            </div>
        </div>
        <div class="mt-4 flex items-center">
            <span class={`text-sm font-medium ${percentChanges.acceptedJobs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentChanges.acceptedJobs >= 0 ? '+' : ''}{percentChanges.acceptedJobs}%
            </span>
            <span class="text-xs text-gray-500 ml-2">vs previous {timeRange}</span>
        </div>
    </div>
    
    <!-- Total Revenue Card -->
    <div class="bg-white rounded-xl shadow-[0_1rem_4rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 class="text-2xl font-bold mt-1">${($totalRevenue / 1000).toFixed(1)}k</h3>
            </div>
            <div class="p-3 bg-purple-50 rounded-lg">
                <span class="material-icons-sharp text-purple-500">payments</span>
            </div>
        </div>
        <div class="mt-4 flex items-center">
            <span class={`text-sm font-medium ${percentChanges.totalRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentChanges.totalRevenue >= 0 ? '+' : ''}{percentChanges.totalRevenue}%
            </span>
            <span class="text-xs text-gray-500 ml-2">vs previous {timeRange}</span>
        </div>
    </div>
    
    <!-- Active Users Card -->
    <div class="bg-white rounded-xl shadow-[0_1rem_3rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-sm font-medium text-gray-500">Active Users</p>
                <h3 class="text-2xl font-bold mt-1">{Math.round($activeUsers)}</h3>
            </div>
            <div class="p-3 bg-amber-50 rounded-lg">
                <span class="material-icons-sharp text-amber-500">people</span>
            </div>
        </div>
        <div class="mt-4 flex items-center">
            <span class={`text-sm font-medium ${percentChanges.activeUsers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentChanges.activeUsers >= 0 ? '+' : ''}{percentChanges.activeUsers}%
            </span>
            <span class="text-xs text-gray-500 ml-2">vs previous {timeRange}</span>
        </div>
    </div>
</div>