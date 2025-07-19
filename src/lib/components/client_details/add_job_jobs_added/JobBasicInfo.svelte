<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import { paymentTypes, permanentTypes } from '$lib/services/job_services/job.type';
    import InputField from '../../general_components/InputField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="grid grid-cols-2 gap-6">
    <div class="space-y-1">
        <InputField
            label="Job Title"
            type="text"
            icon="work"
            bind:value={jobData.jobTitle}
            required={true}
            placeholder="Enter job title"
        />
        {#if errors.jobTitle}
            <p class="text-red-500 text-sm">{errors.jobTitle}</p>
        {/if}
    </div>

    <div class="space-y-2">
        <label for="payment_type" class="block text-sm font-medium text-gray-700">
            Payment Type <span class="text-red-500">*</span>
        </label>
        <div class="relative">
            <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                schedule
            </span>
            <select 
                id="payment_type"
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                bind:value={jobData.paymentType}
                required
            >
                <option value="">Select payment type</option>
                {#each permanentTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </div>
        {#if errors.paymentType}
            <p class="text-red-500 text-sm">{errors.paymentType}</p>
        {/if}
    </div>

    <div class="space-y-2">
        <label for="employment_type" class="block text-sm font-medium text-gray-700">
            Employment Type <span class="text-red-500">*</span>
        </label>
        <div class="relative">
            <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                people
            </span>
            <select 
                id="employment_type"
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200"
                bind:value={jobData.employmentType}
                required
            >
                <option value="">Select employment type</option>
                {#each paymentTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </div>
        {#if errors.employmentType}
            <p class="text-red-500 text-sm">{errors.employmentType}</p>
        {/if}
    </div>

    <div class="space-y-1">
        <InputField
            label="Salary per annum"
            type="number"
            step="0.01"
            icon="attach_money"
            bind:value={jobData.amount}
            placeholder="Enter annual salary"
            required={true}
        />
        {#if errors.amount}
            <p class="text-red-500 text-sm">{errors.amount}</p>
        {/if}
    </div>
</div>
