<!-- <script lang="ts">
    import type { JobData, PermanentType, TemporaryType } from '$lib/services/job_services/job.type';
    import { jobTypes, temporaryTypes, paymentTypes, permanentTypes } from '$lib/services/job_services/job.type';
    import InputField from '../../general_components/InputField.svelte';

    let { jobData = $state<JobData>(), errors = $state<{ [key: string]: string }>({}) } = $props();
    
    // Derived states using $derived instead of $:
    let paymentLabel = $derived(jobData.job_type === 'Permanent' ? 'Salary per annum' : 'Payment Amount');
    let paymentPlaceholder = $derived(jobData.job_type === 'Permanent' ? 'Enter annual salary' : 'Enter amount');
</script> -->
<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import { jobTypes, temporaryTypes, paymentTypes, permanentTypes } from '$lib/services/job_services/job.type';
    import InputField from '../../general_components/InputField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
    
    $: paymentLabel = jobData.job_type === 'Permanent' ? 'Salary per annum' : 'Payment Amount';
    $: paymentPlaceholder = jobData.job_type === 'Permanent' ? 'Enter annual salary' : 'Enter amount';
</script>
<div class="grid grid-cols-2 gap-6">
    <div class="space-y-1">
        <InputField
            label="Job Title"
            type="text"
            icon="work"
            bind:value={jobData.job_title}
            required={true}
            placeholder="Enter job title"
        />
        {#if errors.job_title}
            <p class="text-red-500 text-sm">{errors.job_title}</p>
        {/if}
    </div>

    <div class="space-y-2">
        <label for="job_type" class="block text-sm font-medium text-gray-700">
            Job Type <span class="text-red-500">*</span>
        </label>
        <div class="relative">
            <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                business
            </span>
            <select 
                id="job_type"
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                bind:value={jobData.job_type}
                required
            >
                {#each jobTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </div>
        {#if errors.job_type}
            <p class="text-red-500 text-sm">{errors.job_type}</p>
        {/if}
    </div>

    {#if jobData.job_type === 'Temporary'}
        <div class="space-y-2">
            <label for="temporary_type" class="block text-sm font-medium text-gray-700">
                Temporary Type <span class="text-red-500">*</span>
            </label>
            <div class="relative">
                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    schedule
                </span>
                <select 
                    id="temporary_type"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                    bind:value={jobData.payment_type}
                    required
                >
                    {#each temporaryTypes as type}
                        <option value={type}>{type}</option>
                    {/each}
                </select>
            </div>
            {#if errors.temporary_type}
                <p class="text-red-500 text-sm">{errors.temporary_type}</p>
            {/if}
        </div>
    {:else}
        <div class="space-y-2">
            <label for="temporary_type" class="block text-sm font-medium text-gray-700">
                Permanent Type <span class="text-red-500">*</span>
            </label>
            <div class="relative">
                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    schedule
                </span>
                <select 
                    id="temporary_type"
                    class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                    bind:value={jobData.payment_type}
                    required
                >
                    {#each permanentTypes as type}
                        <option value={type}>{type}</option>
                    {/each}
                </select>
            </div>
            {#if errors.temporary_type}
                <p class="text-red-500 text-sm">{errors.temporary_type}</p>
            {/if}
        </div>
    {/if}

    <div class="space-y-2">
        <label for="employee_type" class="block text-sm font-medium text-gray-700">
            Employee Type <span class="text-red-500">*</span>
        </label>
        <div class="relative">
            <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                people
            </span>
            <select 
                id="employee_type"
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                bind:value={jobData.employment_type}
                required
            >
                {#if jobData.job_type === 'Temporary'}
                    <option value="Temporary">Temporary</option>
                {:else}
                    {#each paymentTypes as type}
                        <option value={type}>{type}</option>
                    {/each}
                {/if}
            </select>
        </div>
        {#if errors.employment_type}
            <p class="text-red-500 text-sm">{errors.employment_type}</p>
        {/if}
    </div>

    <div class="space-y-1">
        <InputField
            label={paymentLabel}
            type="number"
            step="0.01"
            icon="attach_money"
            bind:value={jobData.amount}
            placeholder={paymentPlaceholder}
        />
        {#if errors.amount}
            <p class="text-red-500 text-sm">{errors.amount}</p>
        {/if}
    </div>
</div>