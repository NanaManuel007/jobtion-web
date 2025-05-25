<script lang="ts">
    import type { WorkingHours, DayId } from '$lib/services/job_services/job.type';
    import { weekDays } from '$lib/services/job_services/job.type';

    let { workingHours = $bindable<WorkingHours>({
        sunday: { day: 'sunday', start_at: '', start_end: '' },
        monday: { day: 'monday', start_at: '', start_end: '' },
        tuesday: { day: 'tuesday', start_at: '', start_end: ''},
        wednesday: { day: 'wednesday', start_at: '', start_end: '' },
        thursday: { day: 'thursday', start_at: '', start_end: '' },
        friday: { day: 'friday', start_at: '', start_end: '' },
        saturday: { day: 'saturday', start_at: '', start_end: '' }
    }) } = $props();
    let localWorkingHours = $state(workingHours);

    $effect(() => {
        if (localWorkingHours) {
            workingHours = localWorkingHours;
        }
    });

    function handleDayChange(day: DayId, enabled: boolean) {
        localWorkingHours = {
            ...localWorkingHours,
            [day]: {
                day,
                start_at: enabled ? '09:00' : '',
                start_end: enabled ? '17:00' : ''
            }
        };
    }

    function isDayEnabled(day: DayId): boolean {
        return Boolean(localWorkingHours[day]?.start_at && localWorkingHours[day]?.start_end);
    }
</script>

<div class="w-[400px] border-l pl-8">
    <h3 class="text-xl font-semibold text-gray-800 mb-6">Working Hours</h3>
    <div class="space-y-3">
        {#each weekDays as day}
            <div class="p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <label class="flex items-center gap-3 cursor-pointer">
                    <div class="relative">
                        <input 
                            type="checkbox"
                            checked={isDayEnabled(day.id)}
                            on:change={(e) => handleDayChange(day.id, e.currentTarget.checked)}
                            class="w-5 h-5 border-2 border-gray-300 rounded-md text-gray-600 focus:ring-2 focus:ring-gray-200 cursor-pointer"
                        >
                    </div>
                    <span class="text-base font-medium text-gray-700">{day.label}</span>
                </label>
                
                {#if isDayEnabled(day.id)}
                    <div class="grid grid-cols-2 gap-4 mt-4">
                        <div class="space-y-2">
                            <label for={`${day.id}-start`} class="block text-sm font-medium text-gray-600">Start Time</label>
                            <div class="relative group">
                                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors">schedule</span>
                                <input 
                                    type="time"
                                    id={`${day.id}-start`}
                                    bind:value={localWorkingHours[day.id].start_at}
                                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label for={`${day.id}-end`} class="block text-sm font-medium text-gray-600">End Time</label>
                            <div class="relative group">
                                <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors">schedule</span>
                                <input 
                                    type="time"
                                    id={`${day.id}-end`}
                                    bind:value={localWorkingHours[day.id].start_end}
                                    class="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>