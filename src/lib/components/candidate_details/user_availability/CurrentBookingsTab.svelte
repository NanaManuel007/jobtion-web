
<script lang="ts">

    import type { AppliedJob, TSM,Booking,Candidate } from '$lib/services/candidate_services/candidate.type';
    import { jobActions } from '$lib/services/job_services/job.store';
    import type { BookJob } from '$lib/services/job_services/job.type';
    import BookingDialog from './current_booking/BookingDialog.svelte';
	import ViewBookings from './current_booking/ViewBookings.svelte';
    import ViewTimesheetDialog from './submitted_tms/SubmittedTMSTab.svelte';
    const {appliedJobs,candidateId, candidateName,bookings, candidate} = $props<{appliedJobs:AppliedJob[], candidateId:number, candidateName:string,bookings:Booking[],candidate:Candidate}>();

    let showTimesheetDialog = $state(false);
    let selectedBooking = $state<CurrentBooking | null>(null);
    let showBookingDialog = $state(false);

    // export let appliedJobs: AppliedJob[];
    // export let candidateId: number;
    // export let candidateName: string;
    let showViewBookingsDialog:boolean = $state(false);
// let bookings = $state<Booking[]>([]);
    async function handleViewBookings() {
    try {
        // Assuming you have a service to fetch bookings
        // const response = await candidateServices.getBookings(candidateId);
        // bookings = response.data;
     
        showViewBookingsDialog = true;
    
        showViewBookingsDialog = true;
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toastMessage = 'Failed to fetch bookings';
        toastType = 'error';
        showToast = true;
    }
}

    // Convert AppliedJob array to CurrentBooking format
    let currentBookings = $derived(appliedJobs
        .filter((job:any) => job.job_type === "Temporary" && job.status === "pending")
        .map((job:any) => ({
            jobTitle: job.job_title,
            jobType: job.job_type,
            dateAssigned: job.created_at.split(' ')[0],
            duration: calculateDuration(job),
            progress: calculateTSMProgress(job.tsm), 
            hours: job.hours,
            status: mapStatus(job.status)
        })));
    function calculateDuration(job: AppliedJob): string {
        return job.days_sessions && job.days_sessions.length > 0 ? 
            `${job.days_sessions.length} days` : 
            '3 months';
    }
    function calculateTSMProgress(tsm: TSM[]): number {
    if (!tsm || tsm.length === 0) return 0;
    
    const totalEntries = tsm.length;
    const approvedEntries = tsm.filter(entry => entry.break_time_updated === 2 || entry.break_time_updated ===3).length;
    const pendingEntries = tsm.filter(entry => entry.break_time_updated === 1).length;
    // const rejectedEntries = tsm.filter(entry => entry.break_time_updated === 3).length;
    
    if (approvedEntries === totalEntries) return 100;
    if (pendingEntries > 0) return 50;
    return 30;
}
    function calculateProgress(status: string): number {
        switch(status) {
            case 'completed': return 100;
            case 'accepted': return 50;
            case 'pending': return 10;
            default: return 30;
        }
    }

    function mapStatus(status: string): 'ongoing' | 'completed' | 'pending' {
        if (status === 'completed') return 'completed';
        if (status === 'pending') return 'pending';
        return 'ongoing';
    }

    function handleBookNow() {
        showBookingDialog = true;
    }

    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let bookingError = $state('');
    let bookingLoading = $state(false);

    async function handleAssignJob(jobData: BookJob) {
        bookingLoading = true;
        bookingError = '';

        try {
            const result = await jobActions.createBooking({
                ...jobData,
                candidateId: candidateId!
            });

            if (result.success) {
                showBookingDialog = false;
                toastMessage = `Successfully booked ${candidateName} for the job`;
                toastType = 'success';
                showToast = true;
            } else {
                bookingError = result.error || 'Failed to book candidate';
                toastMessage = 'Booking was not successful';
                toastType = 'error';
                showToast = true;
            }
        } catch (error) {
            bookingError = error instanceof Error ? error.message : 'Failed to book candidate';
            toastMessage = 'Booking was not successful';
            toastType = 'error';
            showToast = true;
        } finally {
            bookingLoading = false;
        }
    }

    type CurrentBooking = {
        jobTitle: string;
        jobType: string;
        dateAssigned: string;
        duration: string;
        progress: number;
        hours: number;
        status: 'ongoing' | 'completed' | 'pending';
    };

    // Pagination and Search
    let itemsPerPage = $state(5);
    let currentPage = $state(1);
    let searchQuery = $state('');

    let filteredBookings = $derived(currentBookings.filter((booking:any) => 
        booking.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.dateAssigned.includes(searchQuery)
    ));

    let totalPages = $derived(Math.ceil(filteredBookings.length / itemsPerPage));
    let paginatedBookings = $derived(filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ));

    function changePage(page: number) {
        currentPage = page;
    }

    function nextPage() {
        if (currentPage < totalPages) currentPage++;
    }

    function prevPage() {
        if (currentPage > 1) currentPage--;
    }

    function handleView(booking: CurrentBooking) {
        selectedBooking = booking;
        showTimesheetDialog = true;
    }

    function handlePrint(booking: CurrentBooking) {
        // Implement print logic
    }

    function handleExport(booking: CurrentBooking) {
        // Implement export logic
    }
</script>

<BookingDialog
candidateId = {candidateId}
    showDialog={showBookingDialog}
    onClose={() => showBookingDialog = false}
    onAssign={handleAssignJob}
    candidateName ={candidateName}
/>

<div class="p-4">
    <div class="mb-4 flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Current Bookings</h2>
            <p class="text-sm text-gray-600 mt-1">View and manage current job assignments</p>
        </div>
        <div class="flex items-center gap-2">
            <button 
            class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            on:click={handleViewBookings}
        >
            <span class="material-icons-sharp text-xs">visibility</span>
            View Bookings 
        </button>
            <button 
            class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            on:click={handleBookNow}
        >
            <span class="material-icons-sharp text-xs">add</span>
            Book Now
        </button>
            <button class="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5">
                <span class="material-icons-sharp text-xs">download</span>
                Export All
            </button>
       
        </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-4 flex items-center gap-4">
        <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center">
                <span class="material-icons-sharp text-gray-400">search</span>
            </span>
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by job title, type or date..."
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
        </div>
        <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Show:</span>
            <select 
                bind:value={itemsPerPage}
                class="border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
            </select>
        </div>
    </div>

    <div class="bg-white shadow-[0_1rem_2rem_rgba(132,139,200,0.18)] rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Type</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Assigned</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#if paginatedBookings.length === 0}
                        <tr>
                            <td colspan="7" class="px-4 py-6 text-center text-gray-500">
                                No bookings found
                            </td>
                        </tr>
                    {:else}
                        {#each paginatedBookings as booking}
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-900">{booking.jobTitle}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{booking.jobType}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{booking.dateAssigned}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{booking.status}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{booking.duration}</td>
                                <td class="px-4 py-3">
                                    <div class="flex items-center">
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                class="bg-gray-600 h-2 rounded-full" 
                                                style="width: {booking.progress}%"
                                            ></div>
                                        </div>
                                        <span class="ml-2 text-xs text-gray-600">{booking.progress}%</span>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600">{booking.hours}h</td>
                                <td class="px-4 py-3 text-sm">
                                    <div class="flex space-x-2">
                                        <button 
                                            class="p-1 hover:bg-gray-100 rounded-full"
                                            on:click={() => handleView(booking)}
                                        >
                                            <span class="material-icons-sharp text-gray-600 text-sm">visibility</span>
                                        </button>
                                        <button 
                                            class="p-1 hover:bg-gray-100 rounded-full"
                                            on:click={() => handlePrint(booking)}
                                        >
                                            <span class="material-icons-sharp text-gray-600 text-sm">print</span>
                                        </button>
                                        <button 
                                            class="p-1 hover:bg-gray-100 rounded-full"
                                            on:click={() => handleExport(booking)}
                                        >
                                            <span class="material-icons-sharp text-gray-600 text-sm">download</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="flex items-center">
                <p class="text-sm text-gray-700">
                    Showing <span class="font-medium">{filteredBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span class="font-medium">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of <span class="font-medium">{filteredBookings.length}</span> results
                </p>
            </div>
            <div class="flex items-center space-x-2">
                <button
                    class="px-3 py-1 rounded-lg text-sm {currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                    on:click={prevPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                
                {#each Array(totalPages) as _, i}
                    {#if totalPages <= 7 || i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
                        <button
                            class="px-3 py-1 rounded-lg text-sm {currentPage === i + 1 ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                            on:click={() => changePage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
                        <span class="px-2 py-1 text-gray-500">...</span>
                    {/if}
                {/each}
                
                <button
                    class="px-3 py-1 rounded-lg text-sm {currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
                    on:click={nextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</div>
{#if selectedBooking}
    <ViewTimesheetDialog
    job={appliedJobs.find((job:any) => job.job_title === selectedBooking!.jobTitle)}
        showDialog={showTimesheetDialog}
        on:close={() => showTimesheetDialog = false}
        candidate={candidate}
        onClose={() => {
            showTimesheetDialog = false;
        }}
    />
{/if}
<BookingDialog
    candidateId={candidateId}
    showDialog={showBookingDialog}
    candidateName ={candidateName}
    
    onClose={() => {
        showBookingDialog = false;
        // candidateId = null;
        // bookingError = '';
    }}
    onAssign={handleAssignJob}

/>
<ViewBookings
showDialog={showViewBookingsDialog}
bookings={bookings}
onClose={() => showViewBookingsDialog = false}
/>