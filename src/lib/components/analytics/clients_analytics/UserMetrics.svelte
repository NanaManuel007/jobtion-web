<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { TooltipItem } from 'chart.js';
    import { fly } from 'svelte/transition';
    
    export let company: any;
    export let timeRange: string;
    
    let canvas: HTMLCanvasElement;
    let chart: Chart | undefined;
    let isLoading = true;
    let userStats = {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        newUsers: 0,
        complaintsResolved: 0,
        complaintsOpen: 0
    };
    
    let recentComplaints: Array<{
        id: number;
        user: string;
        avatar: string;
        issue: string;
        status: 'resolved' | 'pending' | 'in-progress';
        date: string;
    }> = [];
    
    $: if (company && timeRange) {
        loadData();
    }
    
    async function loadData() {
        isLoading = true;
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        userStats = {
            totalUsers: Math.floor(Math.random() * 1000) + 500,
            activeUsers: Math.floor(Math.random() * 500) + 300,
            inactiveUsers: Math.floor(Math.random() * 200) + 50,
            newUsers: Math.floor(Math.random() * 100) + 20,
            complaintsResolved: Math.floor(Math.random() * 50) + 10,
            complaintsOpen: Math.floor(Math.random() * 20) + 5
        };
        
        recentComplaints = [
            {
                id: 1,
                user: 'John Smith',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                issue: 'Payment delay',
                status: 'resolved',
                date: '2 days ago'
            },
            {
                id: 2,
                user: 'Sarah Johnson',
                avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                issue: 'Job cancellation',
                status: 'pending',
                date: '1 day ago'
            },
            {
                id: 3,
                user: 'Michael Brown',
                avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
                issue: 'Incorrect timesheet',
                status: 'in-progress',
                date: '5 hours ago'
            },
            {
                id: 4,
                user: 'Emily Davis',
                avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
                issue: 'Missing payment',
                status: 'pending',
                date: '3 hours ago'
            }
        ];
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Active Users', 'Inactive Users', 'New Users'],
                datasets: [{
                    data: [userStats.activeUsers, userStats.inactiveUsers, userStats.newUsers],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(244, 63, 94, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: [
                        'rgba(16, 185, 129, 1)',
                        'rgba(244, 63, 94, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: TooltipItem<'doughnut'>) {
                                const label = context.label || '';
                                const value = context.raw as number;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        isLoading = false;
    }
    
    onMount(() => {
        if (company) loadData();
        
        return () => {
            if (chart) chart.destroy();
        };
    });
    
    function getStatusColor(status: 'resolved' | 'pending' | 'in-progress') {
        switch(status) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
</script>



<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-[0_1rem_3rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300 lg:col-span-1">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">User Distribution</h3>
        
        <div class="h-64 relative">
            {#if isLoading}
                <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-600"></div>
                </div>
            {/if}
            <canvas bind:this={canvas}></canvas>
        </div>
        
        <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-500">Total Users</p>
                <p class="text-xl font-bold">{userStats.totalUsers}</p>
            </div>
            <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-500">Complaints</p>
                <p class="text-xl font-bold">{userStats.complaintsResolved + userStats.complaintsOpen}</p>
            </div>
        </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-[0_1rem_3rem_rgba(132,139,200,0.2)]  p-6 transition-all duration-300 lg:col-span-2">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Complaints</h3>
        
        {#if isLoading}
            <div class="flex justify-center items-center h-64">
                <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-600"></div>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each recentComplaints as complaint, i}
                            <tr in:fly={{ y: 20, delay: i * 100, duration: 300 }}>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-10 w-10">
                                            <img class="h-10 w-10 rounded-full" src={complaint.avatar} alt={complaint.user}>
                                        </div>
                                        <div class="ml-4">
                                            <div class="text-sm font-medium text-gray-900">{complaint.user}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-900">{complaint.issue}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusColor(complaint.status)}">
                                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {complaint.date}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button class="text-gray-600 hover:text-gray-900">
                                        <span class="material-icons-sharp">visibility</span>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-4 flex justify-center">
                <button class="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                    View all complaints
                    <span class="material-icons-sharp text-sm ml-1">arrow_forward</span>
                </button>
            </div>
        {/if}
    </div>
</div>