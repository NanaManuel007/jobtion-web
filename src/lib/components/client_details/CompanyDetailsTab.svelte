<script lang="ts">
    import { fly } from 'svelte/transition';
	import CircularProgress from './CircularProgress.svelte';
	import type { AppliedCandidate, ClientsType, SelectedClientType } from '$lib/services/client_services/client.type';
	import AddNewClient from '../all_clients/AddNewClient.svelte';
    import { jobs, jobActions } from '$lib/services/job_services/job.store';
	import { API_CONFIG } from '$lib/services/api';
    let isUpdatingStatus= $state(false);
    let showEditModal = $state(false);
    // const {client} = $props<{client:ClientsType}>();

    const {client} = $props<{client:SelectedClientType}>();
    async function loadJobs() {
    try {
        await jobActions.getAllJobs(client.client.id);
    } catch (error) {
        console.error('Failed to load jobs:', error);
    }
}

$effect(() => {
    loadJobs();
});
    let client_detail: ClientsType = $derived(client?.client);
    let appliedCandidate: AppliedCandidate[] = $derived(client?.applied_candidates);

    
    const getStatusColor = (status: number) => {
        return status === 1
            ? 'bg-[#86e49d] text-[#006b21]' 
            : 'bg-[#d893a3] text-[#b30021]';
    };

    // Use let for derived statistics
    let statistics = $derived([
        { 
        label: 'Total Jobs', 
        value: $jobs.length, 
        percentage: Math.min($jobs.length * 10, 100), 
        color: '#6366f1' 
    },
    { 
        label: 'Active Jobs', 
        value: appliedCandidate?.filter(candidate => candidate.status === 'accepted')?.length || 0, 
        percentage: Math.min(((appliedCandidate?.filter(candidate => candidate.status === 'accepted')?.length || 0) * 100) / ($jobs.length || 1), 100),
        color: '#22c55e' 
    },
        { 
            label: 'Total Hires', 
            value: appliedCandidate?.filter(candidate => candidate.status === 'accepted'|| candidate.status==="completed")?.length || 0, 
        percentage: Math.min(((appliedCandidate?.filter(candidate => candidate.status === 'accepted')?.length || 0) * 100) / ($jobs.length || 1), 100),
            color: '#3b82f6' 
        }
    ]);






    function formatDate(dateString: string){
        return new Date(dateString).toLocaleDateString('en-US',{
            year:'numeric',
            month:'long',
            day:'numeric'
        })
    }
</script>
<AddNewClient
showModal = {showEditModal}
existingClient = {client_detail}
on:close={()=> showEditModal = false}
on:clientAdded={()=>showEditModal = false}
/>
<div 
    class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] p-8"
    in:fly={{ x: 100, duration: 800, delay: 300 }}
>
    <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            <img 
                src={API_CONFIG.IMAGE_URL+client_detail?.profile_picture} 
                alt={client?.profile_picture}
                class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
            />
        </div>
        <div>
            <div class="flex items-center gap-2">
                <h3 class=" text-3xl font-bold text-gray-800 mt-2">{client_detail?.company_name}</h3>
                <button class=" text-gray-500 hover:text-gray-700 "
                onclick={()=> showEditModal = true}>
                    <span class="material-icons-sharp text-2xl">edit</span>
                </button>
            </div>
        </div>
        <div class="ml-auto">
            <span class="px-4 py-2 rounded-full {getStatusColor(client_detail?.admin_verification===1?1:0)} font-medium">
                {client_detail?.admin_verification ===0 ? 'Unverified' : 'Verified'}
            </span>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
        <!-- Company Information -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 400 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Company Information</h4>
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">business</span>
                    <div>
                        <p class="text-sm text-gray-500">Company Name</p>
                        <p class="text-gray-800 font-medium">{client_detail?.company_name}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">calendar_today</span>
                    <div>
                        <p class="text-sm text-gray-500">Date Joined</p>
                        <p class="text-gray-800 font-medium">{formatDate(client_detail?.created_at)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">groups</span>
                    <div>
                        <p class="text-sm text-gray-500">Active Candidates</p>
                        <p class="text-gray-800 font-medium">{client_detail?.total_jobs_posted}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 500 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Contact Information</h4>
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">location_on</span>
                    <div>
                        <p class="text-sm text-gray-500">Location</p>
                        <p class="text-gray-800 font-medium">{client_detail?.address}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">verified</span>
                    <div>
                        <p class="text-sm text-gray-500">Verification Status</p>
                        <p class="text-gray-800 font-medium capitalize">{client_detail?.admin_verification ===1 ? 'Verified':'Unverified'}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div 
        class="col-span-2 space-y-6 p-6 bg-gray-50 rounded-xl"
        in:fly={{ x: 100, duration: 800, delay: 600 }}
    >
        <h4 class="text-xl font-semibold text-gray-800 mb-4">Company Statistics</h4>
        <div class="grid grid-cols-3 gap-6">
            {#each statistics as stat}
                <CircularProgress 
                    percentage={stat.percentage}
                    color={stat.color}
                    label={stat.label}
                    value={stat.value}
                />
            {/each}
        </div>
    </div>
    </div>
</div>