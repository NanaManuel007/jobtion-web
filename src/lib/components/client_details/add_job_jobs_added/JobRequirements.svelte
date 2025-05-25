<!-- <script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
</script> -->

<!-- <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-700">Job Requirements</h3>
    {#each jobData.requirements as _, i}
        <TextAreaField
            label={`Requirement ${i + 1}`}
            icon="list_alt"
            bind:value={jobData.requirements[i]}
            placeholder={`Enter requirement ${i + 1}`}
            rows={2}
        />
    {/each}
</div> -->

<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-700">Job Requirements</h3>
    <div class="space-y-4">
        <TextAreaField
            label="Requirement 1"
            icon="list_alt"
            bind:value={jobData.requirment_1}
            placeholder="Enter primary job requirement"
            required={true}
            rows={2}
        />
        {#if errors.requirment_1}
            <p class="text-red-500 text-sm">{errors.requirment_1}</p>
        {/if}

        <TextAreaField
            label="Requirement 2"
            icon="list_alt"
            bind:value={jobData.requirment_2}
            placeholder="Enter additional requirement (optional)"
            rows={2}
        />
        {#if errors.requirment_2}
            <p class="text-red-500 text-sm">{errors.requirment_2}</p>
        {/if}

        <TextAreaField
            label="Requirement 3"
            icon="list_alt"
            bind:value={jobData.requirment_3}
            placeholder="Enter additional requirement (optional)"
            rows={2}
        />
        {#if errors.requirment_3}
            <p class="text-red-500 text-sm">{errors.requirment_3}</p>
        {/if}

        <TextAreaField
            label="Requirement 4"
            icon="list_alt"
            bind:value={jobData.requirment_4}
            placeholder="Enter additional requirement (optional)"
            rows={2}
        />
        {#if errors.requirment_4}
            <p class="text-red-500 text-sm">{errors.requirment_4}</p>
        {/if}
    </div>
</div>