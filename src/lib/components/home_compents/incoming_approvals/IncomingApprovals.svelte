<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { AuthService } from "$lib/services/authentication_services/auth.services";
    import { tsms, tsmActions } from '$lib/services/tsm_services/job.tsm.store';

    function handleViewMore() {
        goto('/private/app_approval');
    }
    let adminDetails: any = null;
    let accessRole: any = null;
    let incomingApprovals = $state<any[]>([]);
    let loading = $state(true);
    
    onMount(async () => {
        try {
            adminDetails = AuthService.getAdminDetails();
            accessRole = AuthService.getAccessRole();
            await tsmActions.fetchAllTSMs();
            incomingApprovals = $tsms
                .filter((tsm: any) => tsm.break_time_updated === 1 || tsm.break_time_updated===0)
                .map((tsm:any) => ({
                    id: tsm.id,
                    user: {
                        name: tsm.first_name + ' ' + tsm.last_name,
                        image: tsm.profile_picture ? `https://node.jobtiondevs.com/${tsm.profile_picture}` : '/user_images/default.jpg'
                    },
                    submittedAt: tsm.day,
                    jobTitle: tsm.job_title || 'TSM',
                    company: tsm.company_name || 'Jobtion'
                }));
        } finally {
            loading = false;
        }
    });
</script>
<div class="">
    <div class="flex justify-end gap-8">
        <div class="bg-gray-200 flex justify-between items-center h-6 w-[4.2rem] cursor-pointer rounded-md">
            <span class="material-icons-sharp bg-blue-500 text-white rounded-md">
                light_mode
            </span>
            <span class="material-icons-sharp text-[1.2rem] w-1/2 h-full flex items-center justify-center">
                dark_mode
            </span>
        </div>

        <div class="flex gap-8 text-right">
            <div class="info">
                <p>Hey, <b>{adminDetails?.full_name || 'Admin'}</b></p>
                <small class="text-muted">{accessRole?.role_name || 'Admin'}</small>
            </div>
            <div class="w-11 h-11 rounded-full overflow-hidden">
                <img src={'/images/icon.png'} alt="Profile">
            </div>
        </div>

    </div>

    <div class="mt-8">
        <div class="flex items-center justify-between mb-2">
            <h2>Incoming Approvals</h2>
            <span class="material-icons-sharp p-2 shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] bg-white rounded-full">
                notifications_none
            </span>
        </div>
        {#each incomingApprovals.slice(0, 8) as approval}
        <div class="bg-white flex items-center gap-4 mb-2 p-4 rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] cursor-pointer transition-all duration-300 ease-in-out hover:shadow-none">
            <div class="w-14 h-12 rounded-full bg-gray-100 overflow-hidden">
                {#if approval.user.image}
                    <img src={approval.user.image} alt={approval.user.name} class="w-full h-full object-cover">
                {:else}
                    <span class="material-icons-sharp text-gray-400 w-full h-full flex items-center justify-center">person</span>
                {/if}
            </div>
            <div class="flex justify-between items-center w-full">
                <div class="info flex flex-row gap-3">
                 <div class="">
                    <h3 class="font-medium text-gray-900">{approval.user.name}</h3>
                    <small class="text-gray-500">
                        {approval.submittedAt}
                    </small>
                 </div>
                    <div class="mt-1">
                        <p class="text-sm text-gray-700">{approval.jobTitle}</p>
                        <p class="text-xs text-gray-500">{approval.company}</p>
                    </div>
                </div>

                <span class="material-icons-sharp text-gray-400">
                    more_vert
                </span>
            </div>
        </div>
    {/each}

        <button 
        type="button"
        on:click={handleViewMore}
        on:keydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleViewMore();
            }
        }}
        class="flex items-center justify-center p-[1rem] mt-[1rem] border-2 border-dashed border-gray-500 text-gray-500 bg-white cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-500 hover:text-white
         rounded-2xl w-full
  ">
            <div class=" flex flex-row gap-5">
                <span class="material-icons">
                    visibility
                </span>
                <h3>View More</h3>
            </div>
        </button>

    </div>

</div>