<script lang="ts">
    import { fade, fly } from 'svelte/transition';

    import { TSMService } from '$lib/services/tsm_services/job.tsm.services';
	import { candidateStore } from '$lib/services/candidate_services/candidate.store';
	import type { Approval,TSMUpdatePayload } from '$lib/services/tsm_services/job.tsm.types';
	import Toast from '$lib/components/general_components/Toast.svelte';
	import { tsmActions } from '$lib/services/tsm_services/job.tsm.store';
    const {approval,showDialog=false,onClose = () => {},} = $props<{approval:Approval,showDialog:boolean, onClose: () => void;}>();
    let userTimesheets: Record<number, UserTimesheet> = $state({});
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let isUpdating: Record<string, boolean> = $state({});
        // let approvals = $state<Approval[]>([]);
        interface UserTimesheet {
		userId: number;
		timeEntries: TimeEntry[];
	}

   
   
    // export let onClose = () => {};
    function handleTimeUpdate(field: 'startTime' | 'endTime' | 'breakTime' | 'amount' | 'location', value: string | number) {
        if (approval) {
            approval[field] = value;
        }
    }
    let selectedTab: 'details' | 'documents' = 'details';


    async function handleApproveEntry(entry: TimeEntry,candidateId:number,) {
    try {
        const success = await tsmActions.approveTSM(entry.id);
        if (success) {
            // Show success toast
            toastType = 'success';
            toastMessage = 'Timesheet approved successfully';
            showToast = true;

            // Update local state to move the entry to approved list
            if (userTimesheets[candidateId]) {
                const entries = userTimesheets[candidateId].timeEntries;
                const updatedEntries = entries.map(e => {
                    if (e.id === entry.id) {
                        return { ...e, status: 2 }; // Set status to approved (2)
                    }
                    return e;
                });
                userTimesheets[candidateId].timeEntries = updatedEntries;
            }

            setTimeout(() => {
                onClose();
            }, 2000);
        }
    } catch (error) {
        console.error('Error approving TSM:', error);
        // Show error toast
        toastType = 'error';
        toastMessage = 'Failed to approve timesheet';
        showToast = true;
    }
}


async function handleRejectEntry(entry: TimeEntry,candidateId:number,) {
    try {
        const success = await tsmActions.declineTSM(entry.id);
        if (success) {
            // Show success toast
            toastType = 'success';
            toastMessage = 'Timesheet rejected successfully';
            showToast = true;

            // Update local state to move the entry to approved list
            if (userTimesheets[candidateId]) {
                const entries = userTimesheets[candidateId].timeEntries;
                const updatedEntries = entries.map(e => {
                    if (e.id === entry.id) {
                        return { ...e, status: 3 }; // Set status to approved (2)
                    }
                    return e;
                });
                userTimesheets[candidateId].timeEntries = updatedEntries;
            }
            setTimeout(() => {
                onClose();
            }, 2000);
            // Switch to approved tab
            // selectedTab = 'approved';
        }
    } catch (error) {
        console.error('Error approving TSM:', error);
        // Show error toast
        toastType = 'error';
        toastMessage = 'Failed to approve timesheet';
        showToast = true;
    }
}




    interface TimeEntry {
		day: string;
		date: string;
		startTime: string;
		id: number;
		endTime: string;
		breakTime: string;
		amount: number;
		status: number;
        location:string;
	}
	async function handleUpdateTSM(entry: TimeEntry,candidateId:number) {
		const entryKey = `${entry.day}-${entry.date}`;
		isUpdating[entryKey] = true;

		try {
			const payload:TSMUpdatePayload = {
				tsm_id: entry.id,
				start: entry.startTime,
				end: entry.endTime,
				break_time: entry.breakTime,
                amount: entry.amount,
                location:entry.location,
			};
            console.log(payload);
			const success = await tsmActions.updateTSM(payload);
			if (success) {
				console.log('client data ',candidateId);
				// Show success toast
				toastType = 'success';
				toastMessage = 'Timesheet updated successfully';
				showToast = true;

				// Refresh both TSM and client data
				await TSMService.getAllTSMs();
				// await initializeUser();
			}
		} catch (error) {
			console.error('Error updating TSM:', error);
			// Show error toast
			toastType = 'error';
			toastMessage = 'Failed to update timesheet';
			showToast = true;
		} finally {
			isUpdating[entryKey] = false;
		}
	}
</script>

{#if showDialog}

    <div 
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        transition:fade
    >
    <Toast 
    show={showToast}
    message={toastMessage}
    type={toastType}
/>
        <div 
            class="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-xl overflow-hidden flex flex-col"
            transition:fly={{ y: 20, duration: 300 }}
        >
            <!-- Header -->
            <div class="p-4 border-b border-gray-200 flex-shrink-0">
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800">Approval Details</h2>
                    <button 
                        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onclick={onClose}
                    >
                        <span class="material-icons-sharp">close</span>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto">
                <div class="p-4">
                    <!-- Tabs -->
                    <div class="flex gap-4 mb-4">
                        <button
                            class="px-4 py-2 rounded-xl transition-all duration-200 {selectedTab === 'details' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}"
                            onclick={() => selectedTab = 'details'}
                        >
                            Details
                        </button>
                        <button
                            class="px-4 py-2 rounded-xl transition-all duration-200 {selectedTab === 'documents' ? 'bg-gray-100 text-gray-800' : 'text-gray-600 hover:bg-gray-50'}"
                            onclick={() => selectedTab = 'documents'}
                        >
                            Documents
                        </button>
                    </div>

                    {#if selectedTab === 'details'}
                        <div class="space-y-4">
                            <!-- Candidate Info -->
                            <div class="bg-gray-50 rounded-xl p-3">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm">Candidate Information</h4>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label for="candidate-name" class="text-xs text-gray-500">Name</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.candidateName}</p>
                                    </div>
                                    <div>
                                        <label for="candidate-email" class="text-xs text-gray-500">Email</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.candidateEmail}</p>
                                    </div>
                                </div>

                                <!-- Time Information -->
                                <div class="space-y-3 mt-3">
                                    <!-- Submitted Times -->
                                    <div class="grid grid-cols-3 gap-3 pb-3 border-b border-gray-200">
                                        <div>
                                            <label for="submitted-start-time" class="text-xs text-gray-500">Submitted Start</label>
                                            <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.submittedStartTime || '09:00'}</p>
                                        </div>
                                        <div>
                                            <label for="submitted-break-time" class="text-xs text-gray-500">Submitted Break</label>
                                            <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.submittedBreakTime || '01:00'}</p>
                                        </div>
                                        <div>
                                            <label for="submitted-end-time" class="text-xs text-gray-500">Submitted End</label>
                                            <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.submittedEndTime || '17:00'}</p>
                                        </div>
                                    </div>
                                    
                                    <!-- Editable Times -->
                                    <div class="grid grid-cols-3 gap-3">
                                        <div>
                                            <label for="start-time" class="text-xs text-gray-500">Update Start</label>
                                            <input
                                                type="time"
                                                value={approval?.startTime || approval?.submittedStartTime || '09:00'}
                                                oninput={(e) => handleTimeUpdate('startTime', e.currentTarget.value)}
                                                class="w-full mt-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label for="break-time" class="text-xs text-gray-500">Update Break</label>
                                            <input
                                                type="time"
                                                value={approval?.breakTime || approval?.submittedBreakTime || '01:00'}
                                                oninput={(e) => handleTimeUpdate('breakTime', e.currentTarget.value)}
                                                class="w-full mt-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label for="end-time" class="text-xs text-gray-500">Update End</label>
                                            <input
                                                type="time"
                                                value={approval?.endTime || approval?.submittedEndTime || '17:00'}
                                                oninput={(e) => handleTimeUpdate('endTime', e.currentTarget.value)}
                                                class="w-full mt-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label for="amount" class="text-xs text-gray-500">Amount (£)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={approval?.amount || 0}
                                                oninput={(e) => handleTimeUpdate('amount', parseFloat(e.currentTarget.value))}
                                                class="w-full mt-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label for="location" class="text-xs text-gray-500">Location</label>
                                            <input
                                                type="text"
                                                value={approval?.location || ''}
                                                oninput={(e) => handleTimeUpdate('location', e.currentTarget.value)}
                                                class="w-full mt-1 px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all"
                                                placeholder="Enter location"
                                            />
                                        </div>
                                    </div>
                                    <div class="flex justify-end">
                                        <button
                                            onclick={() => handleUpdateTSM(approval, approval.candidateId)}
                                            class="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 {isUpdating[
                                                `${approval.day}-${approval.date}`
                                            ]
                                                ? 'cursor-not-allowed opacity-75'
                                                : ''}"
                                            disabled={isUpdating[`${approval.day}-${approval.date}`]}
                                        >
                                            {#if isUpdating[`${approval.day}-${approval.date}`]}
                                                <span class="material-icons-sharp animate-spin text-sm">refresh</span>
                                            {/if}
                                            Update Timesheet
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Job Details -->
                            <div class="bg-gray-50 rounded-xl p-3">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm">Job Details</h4>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label for="job-role" class="text-xs text-gray-500">Role</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.jobRole}</p>
                                    </div>
                                    <div>
                                        <label for="job-type" class="text-xs text-gray-500">Type</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.jobType}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Approval Details -->
                            <div class="bg-gray-50 rounded-xl p-3">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm">Approval Details</h4>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label for="approval-type" class="text-xs text-gray-500">Type</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.approvalType}</p>
                                    </div>
                                    <div>
                                        <label for="status" class="text-xs text-gray-500">Status</label>
                                        <span class="inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium
                                            {approval?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                            {approval?.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label for="amount" class="text-xs text-gray-500">Amount</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">£{approval?.totalAmount}</p>
                                    </div>
                                    <div>
                                        <label for="approval-date" class="text-xs text-gray-500">Date</label>
                                        <p class="font-medium text-gray-800 mt-1 text-sm">{approval?.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <!-- Documents Tab -->
                        <div class="bg-gray-50 rounded-xl p-4">
                            <div class="text-center py-6">
                                <span class="material-icons-sharp text-3xl text-gray-400">description</span>
                                <p class="text-gray-600 mt-2 text-sm">No documents available</p>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
            
            <!-- Action Buttons - Fixed at bottom -->
            <div class="p-4 border-t border-gray-200 flex-shrink-0">
                <div class="flex gap-3">
                    <button
                        class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                        onclick={() => handleApproveEntry(approval, approval.candidateId)}
                    >
                        <span class="material-icons-sharp text-sm">check_circle</span>
                        Approve
                    </button>
                    <button
                        class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                        onclick={()=> handleRejectEntry(approval,approval.candidateId)}
                    >
                        <span class="material-icons-sharp text-sm">cancel</span>
                        Reject
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}