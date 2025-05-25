<script lang="ts">
  import {orders} from '$services/home/stores/orderStoreItems';
  import AnalyticsCard from './analytics/AnalyticsCard.svelte';
  import NewUser from './newUser/NewUser.svelte';
  import OrderTable from './recentOrders/OrderTable.svelte';
  import Reminder from "$lib/components/home_compents/incoming_approvals/IncomingApprovals.svelte";
	import { onMount } from 'svelte';
	import { fade,fly } from 'svelte/transition';
	import { jobActions } from '$lib/services/job_services/job.store';
  let mounted = false;

onMount(() => {
    mounted = true;
    // jobActions.getAllJobsWithoutClientId();
});
</script>

{#if mounted}
<main class="p-6" in:fade={{ duration: 1000 }}>
    <div class="grid grid-cols-12 gap-20 min-w-96">
        <div class="col-span-8 pl-10 min-w-4xl">
            <AnalyticsCard/>
            <NewUser />
            <div class="mt-8">
                <OrderTable/>
            </div>
        </div>
        <div class="col-span-4 pr-10" 
             in:fly={{ duration: 1000, delay: 300, x: 200 }}>
            <Reminder/>
        </div>
    </div>
</main>
{/if}