<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import InputField from '../../general_components/InputField.svelte';
    import DatePickerField from '../../general_components/DatePickerField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="grid grid-cols-2 gap-6">
    <div class="space-y-1">
        <InputField
            label="Job Hours"
            type="number"
            icon="schedule"
            bind:value={jobData.hours}
            required={true}
            placeholder="Enter total hours"
        />
        {#if errors.hours}
            <p class="text-red-500 text-sm">{errors.hours}</p>
        {/if}
    </div>

    <div class="space-y-1">
        <InputField
            label="Location"
            type="text"
            icon="location_on"
            bind:value={jobData.job_location}
            required={true}
            placeholder="Enter job location"
        />
        {#if errors.job_location}
            <p class="text-red-500 text-sm">{errors.job_location}</p>
        {/if}
    </div>

    <div class="space-y-1">
        <DatePickerField
            label="Start Date"
            bind:value={jobData.posted_start_date}
            required={true}
        />
        {#if errors.posted_start_date}
            <p class="text-red-500 text-sm">{errors.posted_start_date}</p>
        {/if}
    </div>

    <div class="space-y-1">
        <InputField
            label="Number of Roles"
            type="number"
            icon="groups"
            bind:value={jobData.posted_roles}
            required={true}
            min="1"
        />
        {#if errors.posted_roles}
            <p class="text-red-500 text-sm">{errors.posted_roles}</p>
        {/if}
    </div>
</div>