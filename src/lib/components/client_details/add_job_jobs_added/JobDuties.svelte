<!-- <script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-700">Job Duties</h3>
    {#each jobData.duties as _, i}
        <div class="space-y-1">
            <TextAreaField
                label={`Duty ${i + 1}`}
                icon="assignment"
                bind:value={jobData.duties[i]}
                required={i === 0}
                placeholder={`Enter duty ${i + 1}`}
                rows={2}
            />
            {#if i === 0 && errors['duties.0']}
                <p class="text-red-500 text-sm">{errors['duties.0']}</p>
            {/if}
        </div>
    {/each}
</div> -->

<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-900">Job Duties</h3>
    <div class="space-y-4">
        <TextAreaField
            label="Duty 1"
            placeholder="Enter primary job duty"
            icon="assignment"
            required={true}
            bind:value={jobData.duty_1}
        />
        {#if errors.duty_1}
            <p class="text-red-500 text-sm">{errors.duty_1}</p>
        {/if}

        <TextAreaField
            label="Duty 2"
            placeholder="Enter additional job duty (optional)"
            icon="assignment"
            bind:value={jobData.duty_2}
        />
        {#if errors.duty_2}
            <p class="text-red-500 text-sm">{errors.duty_2}</p>
        {/if}

        <TextAreaField
            label="Duty 3"
            placeholder="Enter additional job duty (optional)"
            icon="assignment"
            bind:value={jobData.duty_3}
        />
        {#if errors.duty_3}
            <p class="text-red-500 text-sm">{errors.duty_3}</p>
        {/if}

        <TextAreaField
            label="Duty 4"
            placeholder="Enter additional job duty (optional)"
            icon="assignment"
            bind:value={jobData.duty_4}
        />
        {#if errors.duty_4}
            <p class="text-red-500 text-sm">{errors.duty_4}</p>
        {/if}
    </div>
</div>