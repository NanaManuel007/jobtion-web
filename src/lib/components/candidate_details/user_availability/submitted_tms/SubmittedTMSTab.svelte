<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	import { createEventDispatcher, onMount } from 'svelte';
	import { TSMService } from '$lib/services/tsm_services/job.tsm.services';
	import Toast from '$lib/components/general_components/Toast.svelte';
	import type { AppliedJob, Candidate } from '$lib/services/candidate_services/candidate.type';
	import { candidateStore } from '$lib/services/candidate_services/candidate.store';
	const dispatch = createEventDispatcher();
	const { job, showDialog, clientId,candidate,onClose = () => {}, } = $props<{
		job: AppliedJob;
		showDialog: boolean;
        onClose: () => void;
		candidate: Candidate;
	}>();

	let selectedUser: AppliedJob = $state(candidate.id);
	let selectedTab: 'awaiting' | 'approved' | 'rejected' = $state('awaiting');
	let userTimesheets: Record<number, UserTimesheet> = $state({});
	let showToast = $state(false);
	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let isUpdating: Record<string, boolean> = $state({});

    async function initializeUser() {
        if (!job) {
            console.log('No job data available');
            return;
        }
        
        console.log('Job Data:', {
            title: job.job_title,
            type: job.job_type,
            created: job.created_at,
            tsm: job.tsm
        });

        userTimesheets[candidate.id] = {
            userId: candidate.id,
            timeEntries:
                job.tsm?.map((entry: any) => {
                    console.log('Processing TSM entry:', entry);
                    return {
                        day: entry.day,
                        date: job.created_at,
                        startTime: entry.start || '09:00',
                        endTime: entry.end || '17:00',
                        breakTime: entry.break_time || '01:00',
                        amount: entry.amount ,
                        tsm_id: entry.tsm_id,
                        status: entry.break_time_updated
                    };
                }) || []
        };
        
        console.log('Initialized timesheets:', userTimesheets[candidate.id]);
    }
	// tanstackquery

	async function handleUpdateTSM(entry: TimeEntry) {
		const entryKey = `${entry.day}-${entry.date}`;
		isUpdating[entryKey] = true;

		try {
			const payload = {
				tsm_id: entry.tsm_id,
				start: entry.startTime,
				end: entry.endTime,
				break_time: entry.breakTime
			};

			const success = await TSMService.updateTSM(payload);
			if (success) {
				console.log('client data ', candidate.id);
				// Show success toast
				toastType = 'success';
				toastMessage = 'Timesheet updated successfully';
				showToast = true;

				// Refresh both TSM and client data
				await candidateStore.fetchCandidateByIdUpdateDate(candidate.id);
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
	onMount(() => {
		initializeUser();
	});

	interface TimeEntry {
		day: string;
		date: string;
		startTime: string;
		tsm_id: number;
		endTime: string;
		breakTime: string;
		amount: number;
		status: number;
	}

	interface UserTimesheet {
		userId: number;
		timeEntries: TimeEntry[];
	}

	interface PaymentSummary {
		subtotal: number;
		taxDeduction: number;
		platformFee: number;
		total: number;
	}

	// job = sampleUsers;
	selectedUser = job;


    function calculatePaymentSummary(entries: TimeEntry[]): PaymentSummary {
    // Filter only approved entries (status === 2)
    const approvedEntries = entries.filter(e => e.status === 2);
    const subtotal = approvedEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const taxDeduction = subtotal * 0.2; // 20% tax
    const platformFee = subtotal * 0.05; // 5% platform fee
    const total = subtotal - taxDeduction - platformFee;

    return { subtotal, taxDeduction, platformFee, total };
}
	function handleIssuePayment() {
		// const summary = calculatePaymentSummary(userTimesheets[selectedUser.id]?.timeEntries || []);
		// console.log('Issuing payment:', summary);
		// Implement payment logic here
	}
	async function handleClose() {
		await candidateStore.fetchCandidateById(candidate.id);
		// loadingData = false;
		dispatch('close');
	}

    async function handleApproveEntry(entry: TimeEntry) {
    try {
        const success = await TSMService.approveTSM(entry.tsm_id);
        if (success) {
            // Show success toast
            toastType = 'success';
            toastMessage = 'Timesheet approved successfully';
            showToast = true;

            // Update local state to move the entry to approved list
            if (userTimesheets[candidate.id]) {
                const entries = userTimesheets[candidate.id].timeEntries;
                const updatedEntries = entries.map(e => {
                    if (e.tsm_id === entry.tsm_id) {
                        return { ...e, status: 2 }; // Set status to approved (2)
                    }
                    return e;
                });
                userTimesheets[candidate.id].timeEntries = updatedEntries;
            }

            // Switch to approved tab
            selectedTab = 'approved';
        }
    } catch (error) {
        console.error('Error approving TSM:', error);
        // Show error toast
        toastType = 'error';
        toastMessage = 'Failed to approve timesheet';
        showToast = true;
    }
}


async function handleRejectEntry(entry: TimeEntry) {
    try {
        const success = await TSMService.declineTSM(entry.tsm_id);
        if (success) {
            // Show success toast
            toastType = 'success';
            toastMessage = 'Timesheet rejected successfully';
            showToast = true;

            // Update local state to move the entry to approved list
            if (userTimesheets[candidate.id]) {
                const entries = userTimesheets[candidate.id].timeEntries;
                const updatedEntries = entries.map(e => {
                    if (e.tsm_id === entry.tsm_id) {
                        return { ...e, status: 3 }; // Set status to approved (2)
                    }
                    return e;
                });
                userTimesheets[candidate.id].timeEntries = updatedEntries;
            }

            // Switch to approved tab
            selectedTab = 'approved';
        }
    } catch (error) {
        console.error('Error approving TSM:', error);
        // Show error toast
        toastType = 'error';
        toastMessage = 'Failed to approve timesheet';
        showToast = true;
    }
}


	function getFilteredEntries(entries: TimeEntry[]) {
		switch (selectedTab) {
			case 'awaiting':
            return entries.filter((e) => e.status === 0 || e.status === 1);
			case 'approved':
				return entries.filter((e) => e.status === 2);
			case 'rejected':
				return entries.filter((e) => e.status === 3);
		}
	}
	function handleTimeUpdate(
		entry: TimeEntry,
		field: 'startTime' | 'endTime' | 'breakTime',
		value: string
	) {
		entry[field] = value;
	}
</script>

{#if showDialog}
	<div
		tabindex="-1"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
		on:click={handleClose}
		on:keydown={(e) => e.key === 'Escape' && handleClose()}
		role="dialog"
		aria-modal="true"
		transition:fade
	>
		<div
			role="dialog"
			tabindex="0"
			on:keydown={(e) => e.key === 'Enter' && handleClose()}
			class="flex max-h-[256vh] w-[95%] flex-col rounded-3xl bg-white backdrop-blur md:w-[1500px]"
			on:click|stopPropagation
		>
			<!-- Header -->
			<div class="flex items-center justify-between p-8">
				<div>
					<h2 class="text-2xl font-bold text-gray-800">Timesheet Management System</h2>
					<p class="mt-1 text-gray-600">Job: {job.job_title}</p>
				</div>
				<button
					class="rounded-full p-2 transition-all duration-300 hover:bg-gray-100/80"
					on:click={handleClose}
				>
					<span class="material-icons-sharp text-gray-600">close</span>
				</button>
			</div>

			<!--show toast-->
			<Toast bind:show={showToast} message={toastMessage} type={toastType} duration={3000} />
			<!-- Content -->
			<div class="flex flex-1 gap-8 overflow-hidden px-8 pb-8">
				<!-- Left: User List -->
				<div class="w-64 overflow-y-auto rounded-2xl bg-gray-50/50 p-4">
					<h3 class="mb-4 px-2 font-semibold text-gray-700">Assigned Users</h3>
					<div class="w-full rounded-xl bg-white p-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
								<!-- {#if job.profile_picture}
                                    <img src={job.profile_picture} alt={`${job.first_name} ${job.last_name}`} class="w-full h-full rounded-full object-cover">
                                {:else} -->
								<span class="material-icons-sharp text-gray-400">person</span>
								<!-- {/if} -->
							</div>
							<span class="font-medium text-gray-700">{candidate.firstName} {candidate.lastName}</span>
						</div>
					</div>
				</div>

				<!-- Middle: User Details -->
				<div class="w-72 overflow-y-auto rounded-2xl bg-gray-50/50 p-6">
					<h3 class="mb-6 font-semibold text-gray-700">User Details</h3>
					<div class="space-y-6">
						<div class="mb-8 flex justify-center">
							<div class="flex h-28 w-28 items-center justify-center rounded-full bg-white p-1">
								<span class="material-icons-sharp text-5xl text-gray-400">person</span>
							</div>
						</div>
						<div class="rounded-xl bg-white p-4">
							<label for="name" class="text-sm text-gray-500">Name</label>
							<p class="mt-1 font-medium text-gray-800">{candidate.firstName}</p>
						</div>
						<div class="rounded-xl bg-white p-4">
							<label for="email" class="text-sm text-gray-500">Email</label>
							<input
								type="text"
								id="email"
								value={candidate.email}
								readonly
								class="mt-1 w-full border-none bg-transparent p-0 font-medium text-gray-800"
							/>
						</div>
						<div class="rounded-xl bg-white p-4">
							<label for="phone" class="text-sm text-gray-500">Phone</label>
							<input
								type="text"
								id="phone"
								value={candidate.phoneNumber}
								readonly
								class="mt-1 w-full border-none bg-transparent p-0 font-medium text-gray-800"
							/>
						</div>
						<div class="rounded-xl bg-white p-4">
							<label for="address" class="text-sm text-gray-500">Address</label>
							<p class="mt-1 font-medium text-gray-800">{candidate.address || 'N/A'}</p>
						</div>
					</div>
				</div>

				<!-- Right: Timesheet -->
				<div class="flex flex-1 flex-col gap-6">
					<!-- Timesheet Entries -->
					<div class="flex-1 rounded-2xl bg-gray-50/50 p-6">
						<div class="mb-6 flex items-center justify-between">
							<h3 class="font-semibold text-gray-700">Timesheet Entries</h3>
							<div class="flex items-center gap-4 rounded-xl bg-gray-100 p-1">
								<button
									class="rounded-xl px-4 py-2 transition-all duration-200 {selectedTab ===
									'awaiting'
										? 'bg-white text-gray-800'
										: 'text-gray-600 hover:bg-white/50'}"
									on:click={() => (selectedTab = 'awaiting')}
								>
									Awaiting ({userTimesheets[candidate.id]?.timeEntries.filter(
										(e) => e.status === 1 || e.status === 0
									).length || 0})
								</button>
								<button
									class="rounded-xl px-4 py-2 transition-all duration-200 {selectedTab ===
									'approved'
										? 'bg-white text-gray-800'
										: 'text-gray-600 hover:bg-white/50'}"
									on:click={() => (selectedTab = 'approved')}
								>
									Approved ({userTimesheets[candidate.id]?.timeEntries.filter(
										(e) => e.status === 2
									).length || 0})
								</button>
								<button
									class="rounded-xl px-4 py-2 transition-all duration-200 {selectedTab ===
									'rejected'
										? 'bg-white text-gray-800'
										: 'text-gray-600 hover:bg-white/50'}"
									on:click={() => (selectedTab = 'rejected')}
								>
									Rejected ({userTimesheets[candidate.id]?.timeEntries.filter(
										(e) => e.status === 3
									).length || 0})
								</button>
							</div>
						</div>

						<div class="max-h-[400px] space-y-4 overflow-y-auto pr-2">
							{#each getFilteredEntries(userTimesheets[candidate.id]?.timeEntries || []) as entry }
								<div
									class="rounded-xl bg-white p-6 transition-all duration-300"
									in:fly={{ y: 20, duration: 300 }}
									out:fly={{ y: -20, duration: 300 }}
								>
									<div class="mb-4 flex items-start justify-between">
										<div>
											<h4 class="text-lg font-medium text-gray-800">{entry.day}</h4>
											<p class="mt-1 text-sm text-gray-600">{entry.date}</p>
										</div>
										<div class="space-x-2">
											{#if entry.status === 1 || entry.status === 0}
												<button
													class="rounded-full bg-green-50 px-4 py-2 text-sm text-green-700 transition-all duration-300 hover:bg-green-100"
													on:click={() => handleApproveEntry(entry)}
												>
													Approve
												</button>
												<button
													class="rounded-full bg-red-50 px-4 py-2 text-sm text-red-700 transition-all duration-300 hover:bg-red-100"
													on:click={() => handleRejectEntry(entry)}
												>
													Reject
												</button>
											{:else}
												<span
													class="rounded-full px-4 py-2 text-sm font-medium
                                                    {entry.status === 2
														? 'bg-green-50 text-green-700'
														: 'bg-red-50 text-red-700'}"
												>
													{entry.status === 2 ? 'Approved' : 'Rejected'}
												</span>
											{/if}
										</div>
									</div>
									<div class="mt-6 grid grid-cols-4 gap-6">
										<div class="rounded-xl bg-gray-50 p-4">
											<label for="startTime" class="text-sm text-gray-500">Start Time</label>
											<input
												type="time"
												value={entry.startTime}
												on:input={(e) =>
													handleTimeUpdate(entry, 'startTime', e.currentTarget.value)}
												class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
											/>
										</div>
										<div class="rounded-xl bg-gray-50 p-4">
											<label for="breakTime" class="text-sm text-gray-500">Break Time</label>
											<input
												type="time"
												value={entry.breakTime}
												on:input={(e) =>
													handleTimeUpdate(entry, 'breakTime', e.currentTarget.value)}
												class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
											/>
										</div>
										<div class="rounded-xl bg-gray-50 p-4">
											<label for="endTime" class="text-sm text-gray-500">End Time</label>
											<input
												type="time"
												value={entry.endTime}
												on:input={(e) => handleTimeUpdate(entry, 'endTime', e.currentTarget.value)}
												class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
											/>
										</div>
										<div class="rounded-xl bg-gray-50 p-4">
											<label for="amount" class="text-sm text-gray-500">Amount</label>
											<p class="mt-1 font-medium text-gray-800">£{entry.amount}</p>
										</div>
									</div>
									<!-- update button  -->
									<div class="mt-4 flex justify-end">
										<button
											on:click={() => handleUpdateTSM(entry)}
											class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 {isUpdating[
												`${entry.day}-${entry.date}`
											]
												? 'cursor-not-allowed opacity-75'
												: ''}"
											disabled={isUpdating[`${entry.day}-${entry.date}`]}
										>
											{#if isUpdating[`${entry.day}-${entry.date}`]}
												<span class="material-icons-sharp animate-spin">refresh</span>
											{/if}
											Update Timesheet
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>

					{#if selectedTab === 'approved'}
						{@const summary = calculatePaymentSummary(
							userTimesheets[candidate.id]?.timeEntries || []
						)}
						<div class="rounded-2xl bg-white p-6">
							<h3 class="mb-6 font-semibold text-gray-700">
								Payment Summary for {candidate.first_name}
								{candidate.last_name}
							</h3>
							<div class="space-y-4">
								<div class="flex items-center justify-between border-b border-gray-100 py-3">
									<span class="text-gray-600">Subtotal</span>
									<span class="font-medium text-gray-800">£{summary.subtotal.toFixed(2)}</span>
								</div>
								<div class="flex items-center justify-between border-b border-gray-100 py-3">
									<div class="flex items-center gap-2">
										<span class="text-gray-600">Tax Deduction</span>
										<span class="text-xs text-gray-400">(20%)</span>
									</div>
									<span class="font-medium text-red-600">-£{summary.taxDeduction.toFixed(2)}</span>
								</div>
								<div class="flex items-center justify-between border-b border-gray-100 py-3">
									<div class="flex items-center gap-2">
										<span class="text-gray-600">Platform Fee</span>
										<span class="text-xs text-gray-400">(5%)</span>
									</div>
									<span class="font-medium text-red-600">-£{summary.platformFee.toFixed(2)}</span>
								</div>
								<div class="mt-2 flex items-center justify-between py-4">
									<span class="text-lg font-semibold text-gray-800">Total Payment</span>
									<span class="text-lg font-bold text-green-600">£{summary.total.toFixed(2)}</span>
								</div>
								<button
									class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-medium text-white transition-all duration-300 hover:bg-green-600"
									on:click={handleIssuePayment}
								>
									<span class="material-icons-sharp">payments</span>
									Issue Payment
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
