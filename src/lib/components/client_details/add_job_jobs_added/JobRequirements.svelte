<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900">Job Requirements</h3>
    <div class="space-y-4">
        <div class="space-y-1">
            <TextAreaField
                label="Requirement 1"
                icon="list_alt"
                bind:value={jobData.requirement1}
                placeholder="Enter primary job requirement"
                required={true}
                rows={2}
            />
            {#if errors.requirement1}
                <p class="text-red-500 text-sm">{errors.requirement1}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <TextAreaField
                label="Requirement 2"
                icon="list_alt"
                bind:value={jobData.requirement2}
                placeholder="Enter additional requirement (optional)"
                rows={2}
            />
            {#if errors.requirement2}
                <p class="text-red-500 text-sm">{errors.requirement2}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <TextAreaField
                label="Requirement 3"
                icon="list_alt"
                bind:value={jobData.requirement3}
                placeholder="Enter additional requirement (optional)"
                rows={2}
            />
            {#if errors.requirement3}
                <p class="text-red-500 text-sm">{errors.requirement3}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <TextAreaField
                label="Requirement 4"
                icon="list_alt"
                bind:value={jobData.requirement4}
                placeholder="Enter additional requirement (optional)"
                rows={2}
            />
            {#if errors.requirement4}
                <p class="text-red-500 text-sm">{errors.requirement4}</p>
            {/if}
        </div>
    </div>
</div>