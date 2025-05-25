<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import 'chartjs-adapter-date-fns';
    import type { ChartType, ChartDataset } from 'chart.js';
    
    export let company: any;
    export let timeRange: 'week' | 'month' | 'quarter' | 'year';
    
    let canvas: HTMLCanvasElement;
    let chart: Chart;
    let isLoading = true;
    let selectedMetric: 'jobs' | 'revenue' | 'users' = 'jobs';
    
    $: if (company && timeRange && canvas) {
        loadData();
    }
    
    $: if (selectedMetric && chart) {
        updateChartData();
    }
    
    function updateChartData() {
        if (!chart?.data?.labels) return;
        
        const labels = chart.data.labels;
        const datasets: ChartDataset[] = [];
        
        if (selectedMetric === 'jobs') {
            datasets.push({
                label: 'New Jobs',
                data: labels.map(() => Math.floor(Math.random() * 50) + 10),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            });
        } else if (selectedMetric === 'revenue') {
            datasets.push({
                label: 'Revenue',
                data: labels.map(() => Math.floor(Math.random() * 5000) + 1000),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            });
        } else if (selectedMetric === 'users') {
            datasets.push({
                label: 'Active Users',
                data: labels.map(() => Math.floor(Math.random() * 100) + 50),
                borderColor: 'rgba(139, 92, 246, 1)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4
            });
        }
        
        chart.data.datasets = datasets;
        chart.update();
    }
    
    async function loadData() {
        isLoading = true;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const now = new Date();
        let startDate: Date;
        
        if (timeRange === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
        } else if (timeRange === 'month') {
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 1);
        } else if (timeRange === 'quarter') {
            startDate = new Date(now);
            startDate.setMonth(now.getMonth() - 3);
        } else {
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
        }
        
        const dates: Date[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= now) {
            dates.push(new Date(currentDate));
            
            if (timeRange === 'week') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (timeRange === 'month') {
                currentDate.setDate(currentDate.getDate() + 1);
            } else if (timeRange === 'quarter') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else {
                currentDate.setDate(currentDate.getDate() + 14);
            }
        }
        
        if (chart) {
            chart.destroy();
        }
        
        const initialData = dates.map(() => Math.floor(Math.random() * 50) + 10);
        
        chart = new Chart(canvas, {
            type: 'line' as ChartType,
            data: {
                labels: dates,
                datasets: [{
                    label: 'New Jobs',
                    data: initialData,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
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
                        text: 'Trend Analysis'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: timeRange === 'week' ? 'day' : 
                                  timeRange === 'month' ? 'day' : 
                                  timeRange === 'quarter' ? 'week' : 'month'
                        },
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
        <h3 class="text-lg font-semibold text-gray-800">Trend Analysis</h3>
        <div class="flex items-center space-x-2">
            <button 
                class="px-3 py-1.5 rounded-md text-sm font-medium {selectedMetric === 'jobs' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                on:click={() => selectedMetric = 'jobs'}
            >
                Jobs
            </button>
            <button 
                class="px-3 py-1.5 rounded-md text-sm font-medium {selectedMetric === 'revenue' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                on:click={() => selectedMetric = 'revenue'}
            >
                Revenue
            </button>
            <button 
                class="px-3 py-1.5 rounded-md text-sm font-medium {selectedMetric === 'users' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                on:click={() => selectedMetric = 'users'}
            >
                Users
            </button>
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