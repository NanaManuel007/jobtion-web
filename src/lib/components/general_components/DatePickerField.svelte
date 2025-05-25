<script lang="ts">
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    
    export let value: string;
    export let label: string;
    export let required = false;

    let showCalendar = false;
    let currentDate = new Date();
    let selectedDate: Date | null = null;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Initialize the date picker with the provided value
    onMount(() => {
        if (value) {
            try {
                selectedDate = new Date(value);
                // Set current date to the month/year of the selected date for proper display
                currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            } catch (e) {
                console.error("Invalid date format:", value);
                selectedDate = null;
            }
        }
    });

    // Update selectedDate when value changes externally
    $: if (value && (!selectedDate || value !== selectedDate.toISOString().split('T')[0])) {
        try {
            const newDate = new Date(value);
            if (!isNaN(newDate.getTime())) {
                selectedDate = newDate;
                currentDate = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
            }
        } catch (e) {
            console.error("Invalid date format:", value);
        }
    }

    function getDaysInMonth(date: Date) {
        // Existing function remains unchanged
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let days = [];
        for (let i = 0; i < firstDay; i++) {
            const prevDate = new Date(year, month, -i);
            days.unshift({ date: prevDate.getDate(), month: 'prev' });
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, month: 'current' });
        }
        
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ date: i, month: 'next' });
        }
        
        return days;
    }

    function formatDate(date: Date) {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    function handleDateSelect(day: number) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        value = selectedDate.toISOString().split('T')[0];
        showCalendar = false;
    }

    function changeMonth(increment: number) {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    }

    $: calendarDays = getDaysInMonth(currentDate);
</script>

<!-- The rest of the component remains unchanged -->
<div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">
        {label} {#if required}<span class="text-red-500">*</span>{/if}
    </label>
    <div class="relative">
        <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">event</span>
        <input
            type="text"
            readonly
            {required}
            class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent cursor-pointer bg-white"
            placeholder="Select date"
            value={selectedDate ? formatDate(selectedDate) : ''}
            on:click={() => showCalendar = !showCalendar}
        />
    </div>

    {#if showCalendar}
        <div 
            class="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 w-[300px]"
            transition:fade={{ duration: 100 }}
        >
            <!-- Calendar content remains unchanged -->
            <div class="p-3 border-b">
                <div class="flex items-center justify-between">
                    <button 
                        type="button"
                        class="p-1 hover:bg-gray-100 rounded-full"
                        on:click={() => changeMonth(-1)}
                    >
                        <span class="material-icons-sharp">chevron_left</span>
                    </button>
                    <span class="font-medium">
                        {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button 
                        type="button"
                        class="p-1 hover:bg-gray-100 rounded-full"
                        on:click={() => changeMonth(1)}
                    >
                        <span class="material-icons-sharp">chevron_right</span>
                    </button>
                </div>
            </div>

            <div class="p-3">
                <div class="grid grid-cols-7 gap-1">
                    {#each days as day}
                        <div class="text-center text-sm text-gray-500 font-medium">{day}</div>
                    {/each}
                    
                    {#each calendarDays as { date, month }}
                        <button
                            type="button"
                            class="h-8 w-8 flex items-center justify-center rounded-full text-sm
                                {month === 'current' ? 'hover:bg-gray-100' : 'text-gray-400'}
                                {selectedDate && date === selectedDate.getDate() && 
                                month === 'current' && 
                                currentDate.getMonth() === selectedDate.getMonth() && 
                                currentDate.getFullYear() === selectedDate.getFullYear()
                                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                                    : ''}"
                            disabled={month !== 'current'}
                            on:click={() => handleDateSelect(date)}
                        >
                            {date}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="border-t p-3 flex justify-between">
                <button
                    type="button"
                    class="text-sm text-blue-500 hover:text-blue-600"
                    on:click={() => {
                        selectedDate = null;
                        value = '';
                        showCalendar = false;
                    }}
                >
                    Clear
                </button>
                <button
                    type="button"
                    class="text-sm text-blue-500 hover:text-blue-600"
                    on:click={() => {
                        selectedDate = new Date();
                        value = selectedDate.toISOString().split('T')[0];
                        showCalendar = false;
                    }}
                >
                    Today
                </button>
            </div>
        </div>
    {/if}
</div>