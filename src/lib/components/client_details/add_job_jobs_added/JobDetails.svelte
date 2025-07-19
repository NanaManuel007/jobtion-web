<script lang="ts">
    import type { JobData } from '$lib/services/job_services/job.type';
    import InputField from '../../general_components/InputField.svelte';
    import DatePickerField from '../../general_components/DatePickerField.svelte';
    import TextAreaField from '../../general_components/TextAreaField.svelte';

    export let jobData: JobData;
    export let errors: { [key: string]: string };
</script>

<div class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
        <div class="space-y-1">
            <InputField
                label="Job Hours"
                type="number"
                icon="schedule"
                bind:value={jobData.hours}
                required={true}
                placeholder="Enter total hours"
                min="1"
            />
            {#if errors.hours}
                <p class="text-red-500 text-sm">{errors.hours}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <InputField
                label="Job Location"
                type="text"
                icon="location_on"
                bind:value={jobData.jobLocation}
                required={true}
                placeholder="Enter job location"
            />
            {#if errors.jobLocation}
                <p class="text-red-500 text-sm">{errors.jobLocation}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <DatePickerField
                label="Start Date"
                bind:value={jobData.postedStartDate}
                required={true}
            />
            {#if errors.postedStartDate}
                <p class="text-red-500 text-sm">{errors.postedStartDate}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <InputField
                label="Number of Roles"
                type="number"
                icon="groups"
                bind:value={jobData.postedRoles}
                required={true}
                min="1"
                placeholder="Enter number of roles"
            />
            {#if errors.postedRoles}
                <p class="text-red-500 text-sm">{errors.postedRoles}</p>
            {/if}
        </div>
    </div>

    <div class="space-y-4">
        <div class="space-y-1">
            <InputField
                label="Position"
                type="text"
                icon="work_outline"
                bind:value={jobData.position}
                placeholder="Enter position title"
            />
            {#if errors.position}
                <p class="text-red-500 text-sm">{errors.position}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <TextAreaField
                label="Job Description"
                icon="description"
                bind:value={jobData.jobDescription}
                placeholder="Enter detailed job description"
                rows={4}
            />
            {#if errors.jobDescription}
                <p class="text-red-500 text-sm">{errors.jobDescription}</p>
            {/if}
        </div>

        <div class="space-y-1">
            <TextAreaField
                label="Job Requirement"
                icon="checklist"
                bind:value={jobData.jobRequirement}
                placeholder="Enter overall job requirements"
                rows={4}
            />
            {#if errors.jobRequirement}
                <p class="text-red-500 text-sm">{errors.jobRequirement}</p>
            {/if}
        </div>

        <div class="flex items-center space-x-3">
            <input
                type="checkbox"
                id="isPublished"
                bind:checked={jobData.isPublished}
                class="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-2"
            />
            <label for="isPublished" class="text-sm font-medium text-gray-700">
                Publish this job immediately
            </label>
        </div>
    </div>
</div>