<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    
    export let company;
    export let timeRange: 'week' | 'month' | 'quarter' | 'year';
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | undefined;
    let isLoading = true;
    
    $: if (company && timeRange && canvas) {
        loadData();
    }
    
    async function loadData() {
        isLoading = true;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data - replace with actual API data
        const labels = timeRange === 'week' 
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : timeRange === 'month'
                ? Array.from({length: 30}, (_, i) => (i + 1).toString())
                : timeRange === 'quarter'
                    ? ['Jan', 'Feb', 'Mar']
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const postedData = labels.map(() => Math.floor(Math.random() * 50) + 10);
        const acceptedData = labels.map((_, i) => Math.floor(postedData[i] * (Math.random() * 0.5 + 0.3)));
        const completedData = labels.map((_, i) => Math.floor(acceptedData[i] * (Math.random() * 0.5 + 0.4)));
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Posted Jobs',
                        data: postedData,
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Accepted Jobs',
                        data: acceptedData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Completed Jobs',
                        data: completedData,
                        backgroundColor: 'rgba(139, 92, 246, 0.7)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Jobs Overview'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        isLoading = false;
    }
    
    onMount(() => {
        if (company && canvas) loadData();
        
        return () => {
            if (chart) chart.destroy();
        };
    });
</script>

<div class="bg-white rounded-xl shadow-[0_1rem_3rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Jobs Analytics</h3>
        <div class="flex items-center space-x-2">
            <span class="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
            <span class="text-xs text-gray-500">Posted</span>
            <span class="inline-block w-3 h-3 rounded-full bg-green-500 ml-2"></span>
            <span class="text-xs text-gray-500">Accepted</span>
            <span class="inline-block w-3 h-3 rounded-full bg-purple-500 ml-2"></span>
            <span class="text-xs text-gray-500">Completed</span>
        </div>
    </div>
    
    <div class="h-80 relative">
        {#if isLoading}
            <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        {/if}
        <canvas bind:this={canvas}></canvas>
    </div>
</div>