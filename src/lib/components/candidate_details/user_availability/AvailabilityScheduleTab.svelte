<script lang="ts">
    import { fly } from 'svelte/transition';

    type DaySchedule = {
        start: string;
        end: string;
        slots: string[];
    };

    type Availability = {
        [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DaySchedule;
    };

    let activeTab = 'availability';
    const tabs = [
        { id: 'availability', label: 'Availability Schedule', icon: 'schedule' },
        { id: 'current', label: 'Current Bookings', icon: 'event' },
        { id: 'completed', label: 'Completed Bookings', icon: 'event_available' }
    ];

    const timeSlots = [
        'Before School',
        'Morning',
        'After School',
        'Afternoon',
        'Evening',
        'Over Night',
        'All Day'
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let availability: Availability = {
    monday: { 
        start: '08:00', 
        end: '17:00', 
        slots: ['Before School', 'Morning', 'After School'] 
    },
    tuesday: { 
        start: '09:00', 
        end: '18:00', 
        slots: ['Morning', 'Afternoon', 'Evening'] 
    },
    wednesday: { 
        start: '08:30', 
        end: '16:30', 
        slots: ['Before School', 'Morning', 'Afternoon'] 
    },
    thursday: { 
        start: '07:00', 
        end: '19:00', 
        slots: ['Before School', 'Morning', 'After School', 'Evening'] 
    },
    friday: { 
        start: '08:00', 
        end: '15:00', 
        slots: ['Before School', 'Morning', 'After School'] 
    },
    saturday: { 
        start: '10:00', 
        end: '14:00', 
        slots: ['Morning', 'Afternoon'] 
    },
    sunday: { 
        start: '', 
        end: '', 
        slots: [] 
    }
};


    function isDayKey(key: string): key is keyof Availability {
        return key.toLowerCase() in availability;
    }

    function getAvailability(day: string): DaySchedule {
        const key = day.toLowerCase();
        if (isDayKey(key)) {
            return availability[key];
        }
        return { start: '', end: '', slots: [] };
    }

    let selectedSlot: { day: string; time: string } | null = null;
    let showAssignModal = false;

    // function handleSlotClick(day: string, slot: string) {
    //     selectedSlot = { day, time: slot };
    //     showAssignModal = true;
    // }

    function handleAssignJob() {
        showAssignModal = false;
        selectedSlot = null;
    }
    function handleSlotClick(day: string, slot: string) {
    if (getAvailability(day).slots.includes(slot)) {
        selectedSlot = { day, time: slot };
        showAssignModal = true;
    }
}

</script>

<div class="p-4">
    <div class="mb-4 flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Availability Schedule</h2>
            <p class="text-sm text-gray-600 mt-1">Manage teacher's availability and assignments</p>
        </div>
        <button class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5">
            <span class="material-icons-sharp text-xs">save</span>
            Save Changes
        </button>
    </div>

    <div class="bg-white shadow-[0_1rem_2rem_rgba(132,139,200,0.18)] rounded-lg p-4">
        <div class="grid grid-cols-8 gap-2 mb-4">
            <div class="col-span-1"></div>
            {#each days as day}
                <div class="text-center">
                    <div class="text-sm font-semibold text-gray-800">{day}</div>
                    <div class="text-xs text-gray-500">
                        {getAvailability(day).start || '--:--'} - {getAvailability(day).end || '--:--'}
                    </div>
                </div>
            {/each}
        </div>

        <div class="space-y-1"> 
            {#each timeSlots as slot}
                <div class="grid grid-cols-8 gap-3 items-center"> 
                    <div class="text-xs font-medium text-gray-900">{slot}</div> 
                    {#each days as day}
                    <button 
                        type="button"
                        class="aspect-[7/3] rounded-md p-5 transition-all text-[10px] w-full
                            {getAvailability(day).slots.includes(slot)
                                ? 'bg-gray-100 hover:bg-gray-200' 
                                : 'bg-gray-300 opacity-50'}"
                        on:click={() => handleSlotClick(day, slot)}
                        on:keydown={(e) => e.key === 'Enter' && handleSlotClick(day, slot)}
                        disabled={!getAvailability(day).slots.includes(slot)}
                        aria-label="{day} {slot} {getAvailability(day).slots.includes(slot) ? 'Available' : 'Unavailable'}"
                    >
                        <div class="h-full flex flex-col items-center justify-center text-center">
                            <span class="material-icons-sharp text-[10px] {getAvailability(day).slots.includes(slot) ? 'text-gray-600' : 'text-gray-400'}">
                                {getAvailability(day).slots.includes(slot) ? 'event_available' : 'event_busy'}
                            </span>
                            <span class="text-[8px] {getAvailability(day).slots.includes(slot) ? 'text-gray-600' : 'text-gray-400'}">
                                {getAvailability(day).slots.includes(slot) ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </button>
                {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

{#if showAssignModal && selectedSlot}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div 
            class="bg-white rounded-lg p-4 max-w-sm w-full mx-4"
            tabindex="0"
            on:click|stopPropagation 
            on:keydown|stopPropagation
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold">Assign Job</h3>
                <button 
                    class="p-1.5 hover:bg-gray-100 rounded-full"
                    on:click={() => showAssignModal = false}
                >
                    <span class="material-icons-sharp text-sm">close</span>
                </button>
            </div>
            
            <div class="mb-3">
                <p class="text-sm text-gray-600">
                    Assigning job for {selectedSlot.day} - {selectedSlot.time}
                </p>
            </div>

            <div class="space-y-3">
                <div>
                    <label for="school" class="block text-sm font-medium text-gray-700 mb-1">School</label>
                    <select class="w-full p-1.5 border rounded-lg text-sm">
                        <option value="">Select School</option>
                        <option value="school1">Springfield Elementary</option>
                        <option value="school2">Central High School</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select class="w-full p-1.5 border rounded-lg text-sm">
                        <option value="">Select Role</option>
                        <option value="teacher">Teacher</option>
                        <option value="assistant">Teaching Assistant</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <div class="grid grid-cols-2 gap-3">
                        <input type="time" class="p-1.5 border rounded-lg text-sm" placeholder="Start Time">
                        <input type="time" class="p-1.5 border rounded-lg text-sm" placeholder="End Time">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea 
                        class="w-full p-1.5 border rounded-lg text-sm"
                        rows="2"
                        placeholder="Add any additional notes..."
                    ></textarea>
                </div>
            </div>

            <div class="mt-4 flex justify-end gap-2">
                <button 
                    class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    on:click={() => showAssignModal = false}
                >
                    Cancel
                </button>
                <button 
                    class="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    on:click={handleAssignJob}
                >
                    Assign Job
                </button>
            </div>
        </div>
    </div>
{/if}