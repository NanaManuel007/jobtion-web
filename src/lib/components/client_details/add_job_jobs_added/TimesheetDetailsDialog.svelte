<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { WeeklyTimesheetAPI, DayTimesheet } from '$lib/services/job_services/job.type';
    import { JobService } from '$lib/services/job_services/job.services';
    import Toast from '$lib/components/general_components/Toast.svelte';

    export let isOpen = false;
    export let timesheet: WeeklyTimesheetAPI | null = null;

    const dispatch = createEventDispatcher();

    let submitting = false;
    let showToast = false;
    let toastMessage = '';
    let toastType: 'success' | 'error' = 'success';
    let editingDay: string | null = null;
    let editingDayData: DayTimesheet | null = null;

    const daysOfWeek = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ];

    function closeDialog() {
        isOpen = false;
        editingDay = null;
        editingDayData = null;
        dispatch('close');
    }
    // http://zw0s4ggsk000kc8088gsgs4o.46.202.141.196.sslip.io/api/internal-jobs/undefined/candidates/undefined/timesheets/days/5c53d7da-7301-4852-80b3-2163a5be2973

    function calculateHours(start: string, finish: string, breakTime: string): number {
        if (!start || !finish) return 0;
        
        const startTime = new Date(`2000-01-01T${start}:00`);
        const finishTime = new Date(`2000-01-01T${finish}:00`);
        const breakMinutes = breakTime ? parseInt(breakTime.split(':')[0]) * 60 + parseInt(breakTime.split(':')[1]) : 0;
        
        const totalMinutes = (finishTime.getTime() - startTime.getTime()) / (1000 * 60) - breakMinutes;
        return Math.max(0, totalMinutes / 60);
    }

    function calculateTotalHours(): number {
        if (!timesheet) return 0;
        
        return daysOfWeek.reduce((total, day) => {
            const dayData = timesheet[day.key as keyof WeeklyTimesheetAPI] as DayTimesheet;
            if (!dayData) return total;
            return total + calculateHours(dayData.start, dayData.finish, dayData.break);
        }, 0);
    }

    function calculateTotalExpenses(): number {
        if (!timesheet) return 0;
        
        return daysOfWeek.reduce((total, day) => {
            const dayData = timesheet[day.key as keyof WeeklyTimesheetAPI] as DayTimesheet;
            if (!dayData) return total;
            return total + (dayData.expense || 0);
        }, 0);
    }

    function calculateTotalMiles(): number {
        if (!timesheet) return 0;
        
        return daysOfWeek.reduce((total, day) => {
            const dayData = timesheet[day.key as keyof WeeklyTimesheetAPI] as DayTimesheet;
            if (!dayData) return total;
            return total + (dayData.miles || 0);
        }, 0);
    }

    function startEditingDay(dayKey: string, dayData: DayTimesheet) {
        editingDay = dayKey;
        editingDayData = { ...dayData };
    }

    function cancelEditingDay() {
        editingDay = null;
        editingDayData = null;
    }

    async function saveDayChanges() {
        if (!editingDay || !editingDayData || !timesheet) return;
        
        // Debug logging to identify the issue
        console.log('Timesheet object:', timesheet);
        console.log('JobId:', timesheet.internalJobId);
        console.log('InternalJobId:', timesheet.internalJobId);
        console.log('UserId:', timesheet.userId);
        
        // Use internalJobId if jobId is undefined
        const jobId = timesheet.internalJobId;
        const candidateId = timesheet.candidateId || timesheet.userId;
        
        // Validate required IDs
        if (!jobId || !candidateId) {
            toastMessage = `Missing required IDs. JobId: ${jobId}, CandidateId: ${candidateId}`;
            toastType = 'error';
            showToast = true;
            return;
        }
        
        try {
            submitting = true;
            
            const dayData = timesheet[editingDay as keyof WeeklyTimesheetAPI] as any;
            if (!dayData?.id) {
                throw new Error('Day timesheet ID not found');
            }
            
            // Ensure time fields have the correct format (HH:MM:SS)
            const formattedData = { ...editingDayData };
            if (formattedData.start && !formattedData.start.includes(':')) {
                formattedData.start = `${formattedData.start}:00`;
            } else if (formattedData.start && formattedData.start.split(':').length === 2) {
                formattedData.start = `${formattedData.start}:00`;
            }
            
            // Add status 'admin-edited' to indicate the day was edited by an admin
            const updatedDayData = await JobService.updateDayTimesheet(
                jobId,
                candidateId,
                dayData.id,
                { ...formattedData, status: 'admin-edited' }
            );
            
            // Update the timesheet object
            (timesheet as any)[editingDay] = updatedDayData;
            
            // Reset editing state
            editingDay = null;
            editingDayData = null;
            
            toastMessage = 'Day timesheet updated successfully!';
            toastType = 'success';
            showToast = true;
            
            dispatch('dayUpdated', { day: editingDay, dayData: updatedDayData });
        } catch (error) {
            console.error('Error updating day timesheet:', error);
            toastMessage = 'Failed to update day timesheet';
            toastType = 'error';
            showToast = true;
        } finally {
            submitting = false;
        }
    }

    async function approveDayTimesheet(dayKey: string) {
        if (!timesheet) return;
        
        // Debug logging
        console.log('Approving day timesheet:', { dayKey, timesheet });
        
        // Use internalJobId if jobId is undefined
        const jobId = timesheet.jobId || timesheet.internalJobId;
        const candidateId = timesheet.candidateId || timesheet.userId;
        
        // Validate required IDs
        if (!jobId || !candidateId) {
            toastMessage = `Missing required IDs. JobId: ${jobId}, CandidateId: ${candidateId}`;
            toastType = 'error';
            showToast = true;
            return;
        }
        
        try {
            submitting = true;
            
            const dayData = timesheet[dayKey as keyof WeeklyTimesheetAPI] as any;
            if (!dayData?.id) {
                throw new Error('Day timesheet ID not found');
            }
            
            const updatedDayData = await JobService.updateDayTimesheet(
                jobId,
                candidateId,
                dayData.id,
                { ...dayData, status: 'admin-approved' }
            );
            
            // Update the timesheet object
            (timesheet as any)[dayKey] = updatedDayData;
            
            toastMessage = 'Day timesheet approved successfully!';
            toastType = 'success';
            showToast = true;
            
            dispatch('dayApproved', { day: dayKey, dayData: updatedDayData });
        } catch (error) {
            console.error('Error approving day timesheet:', error);
            toastMessage = 'Failed to approve day timesheet';
            toastType = 'error';
            showToast = true;
        } finally {
            submitting = false;
        }
    }

    async function rejectDayTimesheet(dayKey: string) {
        if (!timesheet) return;
        
        // Debug logging
        console.log('Rejecting day timesheet:', { dayKey, timesheet });
        
        // Use internalJobId if jobId is undefined
        const jobId = timesheet.jobId || timesheet.internalJobId;
        const candidateId = timesheet.candidateId || timesheet.userId;
        
        // Validate required IDs
        if (!jobId || !candidateId) {
            toastMessage = `Missing required IDs. JobId: ${jobId}, CandidateId: ${candidateId}`;
            toastType = 'error';
            showToast = true;
            return;
        }
        
        try {
            submitting = true;
            
            const dayData = timesheet[dayKey as keyof WeeklyTimesheetAPI] as any;
            if (!dayData?.id) {
                throw new Error('Day timesheet ID not found');
            }
            
            const updatedDayData = await JobService.updateDayTimesheet(
                jobId,
                candidateId,
                dayData.id,
                { ...dayData, status: 'admin-rejected' }
            );
            
            // Update the timesheet object
            (timesheet as any)[dayKey] = updatedDayData;
            
            toastMessage = 'Day timesheet rejected successfully!';
            toastType = 'success';
            showToast = true;
            
            dispatch('dayRejected', { day: dayKey, dayData: updatedDayData });
        } catch (error) {
            console.error('Error rejecting day timesheet:', error);
            toastMessage = 'Failed to reject day timesheet';
            toastType = 'error';
            showToast = true;
        } finally {
            submitting = false;
        }
    }

    async function handleApprove() {
        if (!timesheet) return;
        
        submitting = true;
        try {
            await updateTimesheetStatus('completed');
            
            toastMessage = 'Timesheet approved successfully!';
            toastType = 'success';
            showToast = true;
            
            dispatch('approved', timesheet);
            closeDialog();
        } catch (error) {
            toastMessage = 'Failed to approve timesheet';
            toastType = 'error';
            showToast = true;
        } finally {
            submitting = false;
        }
    }

    async function handleReject() {
        if (!timesheet) return;
        
        submitting = true;
        try {
            await updateTimesheetStatus('rejected');
            
            toastMessage = 'Timesheet rejected successfully!';
            toastType = 'success';
            showToast = true;
            
            dispatch('rejected', timesheet);
            closeDialog();
        } catch (error) {
            toastMessage = 'Failed to reject timesheet';
            toastType = 'error';
            showToast = true;
        } finally {
            submitting = false;
        }
    }

    async function updateTimesheetStatus(status: string) {
        if (!timesheet) return;
        
        // Debug logging
        console.log(`Updating timesheet ${timesheet?.id} status to ${status}`);
        
        // Use internalJobId if jobId is undefined
        const jobId = timesheet.jobId || timesheet.internalJobId;
        const candidateId = timesheet.candidateId || timesheet.userId;
        
        // Validate required IDs
        if (!jobId || !candidateId || !timesheet.id) {
            throw new Error(`Missing required IDs. JobId: ${jobId}, CandidateId: ${candidateId}, TimesheetId: ${timesheet.id}`);
        }
        
        // Call the service to update the timesheet status
        const result = await JobService.updateWeeklyTimesheetStatus(
            jobId,
            candidateId,
            timesheet.id,
            status
        );
        
        // Update the local timesheet object with the new status
        if (timesheet) {
            timesheet.weeklyStatus = status;
        }
        
        // Dispatch the timesheetUpdated event to trigger a refresh in the parent component
        dispatch('timesheetUpdated');
        
        return result;
    }
</script>

{#if isOpen && timesheet}
    <div class="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <!-- Header - Changed to gray styling -->
            <div class="bg-gray-600 text-white p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold">Timesheet Details</h2>
                        <p class="text-gray-100 mt-1">
                            Week of {new Date(timesheet.weekStartDate).toLocaleDateString()} ("{timesheet.weeklyStatus}")
                        </p>
                    </div>
                    <button 
                        on:click={closeDialog}
                        class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <!-- Summary Cards - Changed to gray styling -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Total Hours</p>
                                <p class="text-2xl font-bold text-gray-800">{calculateTotalHours().toFixed(1)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Total Expenses</p>
                                <p class="text-2xl font-bold text-gray-800">£{calculateTotalExpenses().toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Total Miles</p>
                                <p class="text-2xl font-bold text-gray-800">{calculateTotalMiles().toFixed(1)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <svg class="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p class="text-sm text-gray-600 font-medium">Status</p>
                                <p class="text-lg font-bold text-gray-800 capitalize">{timesheet.weeklyStatus}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Daily Breakdown with Edit Functionality -->
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                    
                    {#each daysOfWeek as day}
                        {@const dayData = timesheet[day.key]}
                        {#if dayData && (dayData.start || dayData.finish)}
                            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="font-semibold text-gray-800 flex items-center">
                                        <span class="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                                        {day.label}
                                        {#if dayData.status}
                                            <span class="ml-2 px-2 py-1 text-xs rounded-full {dayData.status === 'admin-approved' ? 'bg-green-100 text-green-800' : dayData.status === 'admin-rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}">
                                                {dayData.status}
                                            </span>
                                        {/if}
                                    </h4>
                                    <div class="flex items-center space-x-2">
                                        <span class="text-sm text-gray-500">
                                            {new Date(dayData.workDate).toLocaleDateString()}
                                        </span>
                                        <div class="flex space-x-1">
                                            <button 
                                                on:click={() => startEditingDay(day.key, dayData)}
                                                class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                                disabled={submitting}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                on:click={() => approveDayTimesheet(day.key, dayData)}
                                                class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                                disabled={submitting || dayData.status === 'admin-approved'}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                on:click={() => rejectDayTimesheet(day.key, dayData)}
                                                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                disabled={submitting || dayData.status === 'admin-rejected'}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {#if editingDay === day.key && editingDayData}
                                    <!-- Edit Mode -->
                                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Start</label>
                                            <input 
                                                type="time" 
                                                bind:value={editingDayData.start}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Finish</label>
                                            <input 
                                                type="time" 
                                                bind:value={editingDayData.finish}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Break</label>
                                            <input 
                                                type="time" 
                                                bind:value={editingDayData.break}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                                            <p class="font-medium py-1">{calculateHours(editingDayData.start, editingDayData.finish, editingDayData.break).toFixed(1)}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Expenses</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                bind:value={editingDayData.expense}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Miles</label>
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                bind:value={editingDayData.miles}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                                            <select 
                                                bind:value={editingDayData.rating}
                                                class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            >
                                                {#each Array(6) as _, i}
                                                    <option value={i}>{i}</option>
                                                {/each}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-3">
                                        <label class="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                        <textarea 
                                            bind:value={editingDayData.notes}
                                            class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                            rows="2"
                                        ></textarea>
                                    </div>
                                    
                                    <div class="mt-3 flex space-x-2">
                                        <button 
                                            on:click={saveDayChanges}
                                            disabled={submitting}
                                            class="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {#if submitting}
                                                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1 inline-block"></div>
                                            {/if}
                                            Save
                                        </button>
                                        <button 
                                            on:click={cancelEditingDay}
                                            class="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                {:else}
                                    <!-- View Mode -->
                                    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Start</label>
                                            <p class="font-medium">{dayData.start || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Finish</label>
                                            <p class="font-medium">{dayData.finish || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Break</label>
                                            <p class="font-medium">{dayData.break || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Hours</label>
                                            <p class="font-medium">{calculateHours(dayData.start, dayData.finish, dayData.break).toFixed(1)}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Expenses</label>
                                            <p class="font-medium">£{(dayData.expense || 0).toFixed(2)}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Miles</label>
                                            <p class="font-medium">{(dayData.miles || 0).toFixed(1)}</p>
                                        </div>
                                        
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                                            <div class="flex items-center">
                                                {#each Array(5) as _, i}
                                                    <svg class="w-4 h-4 {i < dayData.rating ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                    </svg>
                                                {/each}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {#if dayData.notes}
                                        <div class="mt-3 pt-3 border-t border-gray-200">
                                            <label class="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                            <p class="text-sm text-gray-700">{dayData.notes}</p>
                                        </div>
                                    {/if}
                                {/if}
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>

            <!-- Footer Actions -->
            {#if timesheet.weeklyStatus === 'pending'}
                <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                    <button 
                        on:click={closeDialog}
                        class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    
                    <!-- <button 
                        on:click={handleReject}
                        disabled={submitting}
                        class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                    >
                        {#if submitting}
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {/if}
                        Reject
                    </button> -->
                    
                    <button 
                        on:click={handleApprove}
                        disabled={submitting}
                        class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                    >
                        {#if submitting}
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {/if}
                        Complete Week
                    </button>
                </div>
            {:else}
                <div class="bg-gray-50 px-6 py-4 flex justify-end border-t">
                    <button 
                        on:click={closeDialog}
                        class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<Toast bind:show={showToast} message={toastMessage} type={toastType} />