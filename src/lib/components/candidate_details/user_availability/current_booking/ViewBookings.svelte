<script lang="ts">
import type { Booking } from '$lib/services/candidate_services/candidate.type';

// <!-- let {showDialog,onClose} = $props<{showDialog:boolean}>(); -->
let {showDialog,bookings, onClose = () => {}} = $props<{ showDialog:boolean,onClose?: () => void, bookings:Booking[]}>();

// let onClose = $props<() => void>();
// let bookings = $props<Booking[]>();

    </script>
<div class="fixed inset-0  bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" class:hidden={!showDialog}>
    <div class="bg-white rounded-lg p-6 w-full max-w-3xl">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">View Bookings</h2>
            <button on:click={onClose} class="text-gray-500 hover:text-gray-700">
                <span class="material-icons-sharp">close</span>
            </button>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="bg-gray-100">
                        <th class="px-4 py-2 text-left">Company</th>
                        <th class="px-4 py-2 text-left">Job Title</th>
                        <th class="px-4 py-2 text-left">Candidate Status</th>
                        <th class="px-4 py-2 text-left">Booking Status</th>
                    </tr>
                </thead>
                <tbody>
                    {#each bookings as booking}
                        <tr class="border-b">
                            <td class="px-4 py-2">{booking.company_name}</td>
                            <td class="px-4 py-2">{booking.job_title}</td>
                            <td class="px-4 py-2">{booking.candidate_status}</td>
                            <td class="px-4 py-2">{booking.booking_status}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>