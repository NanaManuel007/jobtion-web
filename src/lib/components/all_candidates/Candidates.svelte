
<script lang="ts">
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
    import type { Candidate } from '$lib/services/candidate_services/candidate.types';
    import SearchBar from '$lib/components/all_clients/SearchBar.svelte';
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import BookingDialog from '../candidate_details/user_availability/current_booking/BookingDialog.svelte';
    import { jobActions } from '$lib/services/job_services/job.store';
    import type { BookJob } from '$lib/services/job_services/job.type';
    import Toast from '$lib/components/general_components/Toast.svelte';
    import { API_CONFIG } from '$lib/services/api';

    let mounted = $state(false);
    let searchTerm = $state('');
    let verificationFilter = $state('all');
    let emailVerificationFilter = $state('all');

    let showVerificationDialog = $state(false);
    let selectedCandidate = $state<Candidate | null>(null);
    let verificationStatus = $state(false); // 0: unverified, 1: verified
    let verificationLoading = $state(false);
    let verificationError = $state('');

    let showBookingDialog = $state(false);
    let candidateId = $state('');
    let candidateName = $state('');

    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');

    onMount(async () => {
        mounted = true;
        await candidateStore.fetchCandidates();
    });

    function handleBook(candidate: Candidate) {
        candidateId = candidate.id;
        candidateName = `${candidate.firstName} ${candidate.lastName}`;
        showBookingDialog = true;
    }
    function goToPage(page: number) {
        candidateStore.goToPage(page);
    }
    // Remove the getFilteredCandidates function as we'll handle filtering in the store

    // Updated search effect
    $effect(() => {
        if (mounted && searchTerm.trim()) {
            console.log('Search triggered:', searchTerm);
            candidateStore.searchCandidates(searchTerm.trim());
        } else if (mounted) {
            candidateStore.fetchCandidates();
        }
    });

    // Effect for admin verification filter
    $effect(() => {
        if (mounted) {
            let isAdminVerified: boolean | null = null;
            if (verificationFilter === 'verified') {
                isAdminVerified = true;
            } else if (verificationFilter === 'unverified') {
                isAdminVerified = false;
            }
            candidateStore.filterByAdminVerification(isAdminVerified);
        }
    });

    // Effect for email verification filter
    $effect(() => {
        if (mounted) {
            let isEmailVerified: boolean | null = null;
            if (emailVerificationFilter === 'verified') {
                isEmailVerified = true;
            } else if (emailVerificationFilter === 'unverified') {
                isEmailVerified = false;
            }
            candidateStore.filterByEmailVerification(isEmailVerified);
        }
    });

    function handleVerify(candidate: Candidate) {
        selectedCandidate = candidate;
        verificationStatus = candidate.isAdminVerified ; // Toggle verification
        showVerificationDialog = true;
    }

    async function confirmVerification() {
        if (!selectedCandidate) return;
        
        verificationLoading = true;
        verificationError = '';

        try {
            const result = await candidateStore.verifyCandidate(
                selectedCandidate.id,
                verificationStatus
            );

            if (result.success) {
                showVerificationDialog = false;
                selectedCandidate = null;
                // Refresh candidates list
                await candidateStore.fetchCandidates();
            } else {
                verificationError = result.message;
            }
        } catch (error) {
            verificationError = 'Failed to verify candidate';
        } finally {
            verificationLoading = false;
        }
    }

         function handleView(candidateId: string) {
        goto(`/private/all_candidates/candidate_details/${candidateId}`);
    }
</script>

{#if mounted}
<div class="p-10">
    <Toast
        bind:show={showToast}
        message={toastMessage}
        type={toastType}
    />
    
    {#if showVerificationDialog}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 class="text-xl font-semibold mb-4">
                Verify Candidate: {selectedCandidate?.firstName} {selectedCandidate?.lastName}
            </h2>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                </label>
                <select
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={verificationStatus}
                >
                    <option value={0}>Unverified</option>
                    <option value={1}>Verified</option>
                </select>
            </div>

            {#if verificationError}
            <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {verificationError}
            </div>
            {/if}

            <div class="flex justify-end gap-3">
                <button
                    class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    onclick={() => {
                        showVerificationDialog = false;
                        selectedCandidate = null;
                        verificationError = '';
                    }}
                    disabled={verificationLoading}
                >
                    Cancel
                </button>
                <button
                    class="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onclick={confirmVerification}
                    disabled={verificationLoading}
                >
                    {verificationLoading ? 'Verifying...' : 'Confirm'}
                </button>
            </div>
        </div>
    </div>
    {/if}
    
    <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
        <section class="w-full overflow-hidden">
            <div class="w-full bg-white/25 p-6 flex items-center">
                <h1 class="text-5xl font-semibold">Candidates</h1>
                <div class="flex-grow"></div>
                <div class="flex items-center gap-4">
                    <select
                        class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        bind:value={verificationFilter}
                    >
                        <option value="all">All Admin Status</option>
                        <option value="verified">Admin Verified</option>
                        <option value="unverified">Admin Unverified</option>
                    </select>
                    <select
                        class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        bind:value={emailVerificationFilter}
                    >
                        <option value="all">All Email Status</option>
                        <option value="verified">Email Verified</option>
                        <option value="unverified">Email Unverified</option>
                    </select>
                    <SearchBar bind:searchTerm />
                </div>
            </div>
            
            {#if $candidateStore.loading}
            <div class="flex flex-col justify-center items-center h-64" in:fade={{ duration: 300 }}>
                <div class="relative w-24 h-24">
                    <div class="absolute top-0 left-0 right-0 bottom-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-75"></div>
                    <div class="absolute top-1 left-1 right-1 bottom-1 bg-white rounded-full"></div>
                    <div class="absolute top-3 left-3 right-3 bottom-3 animate-spin">
                        <div class="h-full w-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full"></div>
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                </div>
                <p class="mt-4 text-gray-600 font-medium animate-pulse">Loading candidates data...</p>
            </div>
            {:else if $candidateStore.error}
                <div class="p-8 text-center text-red-600">
                    {$candidateStore.error}
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="text-left p-4 font-medium text-gray-600">Candidate</th>
                                <th class="text-left p-4 font-medium text-gray-600">Email</th>
                                <th class="text-left p-4 font-medium text-gray-600">Phone Number</th>
                                <th class="text-left p-4 font-medium text-gray-600">Joined Date</th>
                                <th class="text-center p-4 font-medium text-gray-600">Email Verified</th>
                                <th class="text-center p-4 font-medium text-gray-600">Admin Verification</th>
                                <th class="text-center p-4 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each $candidateStore.candidates.filter(candidate => !candidate.email.includes('deleted_user')) as candidate}
                                <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                                    <td class="p-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                                <img src={candidate.profilePictureUrl !== null ? API_CONFIG.IMAGE_URL + candidate.profilePictureUrl : '/user_images/default.jpg'} alt={`${candidate.firstName} ${candidate.lastName}`} class="w-full h-full object-cover">
                                            </div>
                                            <span class="font-medium">{candidate.firstName} {candidate.lastName}</span>
                                        </div>
                                    </td>
                                    <td class="p-4">{candidate.email}</td>
                                    <td class="p-4">{candidate.phoneNumber}</td>
                                    <td class="p-4">{new Date(candidate.createdAt).toLocaleDateString()}</td>
                                    <td class="p-4 text-center">
                                        <span class="inline-block px-2 py-1 rounded-full text-xs font-medium {candidate.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                            {candidate.isEmailVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td class="p-4 text-center">
                                        <span class="inline-block px-2 py-1 rounded-full text-xs font-medium {candidate.isAdminVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                            {candidate.isAdminVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td class="p-4">
                                        <div class="flex items-center justify-left gap-2">
                                            <button
                                                class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                                onclick={() => handleView(candidate.id)}
                                            >
                                                <span class="material-icons-sharp text-gray-600">visibility</span>
                                            </button>
                                            <button
                                                class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                                onclick={() => handleBook(candidate)}
                                            >
                                                <span class="material-icons-sharp text-gray-600">menu_book</span>
                                            </button>
                                            {#if !candidate.isAdminVerified}
                                                <button
                                                    class="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                                    onclick={() => handleVerify(candidate)}
                                                >
                                                    <span class="material-icons-sharp text-gray-600">verified_user</span>
                                                </button>
                                            {/if}
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                
                {#if $candidateStore.pagination.totalPages > 0}
                <div class="flex items-center justify-between px-6 py-4 border-t">
                    <div class="text-sm text-gray-600">
                        Showing {($candidateStore.pagination.page - 1) * $candidateStore.pagination.pageSize + 1} to {Math.min($candidateStore.pagination.page * $candidateStore.pagination.pageSize, $candidateStore.pagination.totalCount)} of {$candidateStore.pagination.totalCount} entries
                    </div>
                    <div class="flex items-center gap-2">
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!$candidateStore.pagination.hasPreviousPage}
                            onclick={() => goToPage($candidateStore.pagination.page - 1)}
                        >
                            <span class="material-icons-sharp">chevron_left</span>
                        </button>
                        
                        {#each Array($candidateStore.pagination.totalPages) as _, i}
                            <button 
                                class={`min-w-[32px] h-8 rounded-lg transition-colors ${$candidateStore.pagination.page === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                onclick={() => goToPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        {/each}
                        
                        <button 
                            class="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!$candidateStore.pagination.hasNextPage}
                            onclick={() => goToPage($candidateStore.pagination.page + 1)}
                        >
                            <span class="material-icons-sharp">chevron_right</span>
                        </button>
                    </div>
                </div>
                {/if}
            {/if}
        </section>
    </main>
</div>

<!-- <BookingDialog
    candidateId={candidateId}
    showDialog={showBookingDialog}
    candidateName={candidateName}
    onClose={() => {
        showBookingDialog = false;
        bookingError = '';
    }}
    onAssign={handleAssignJob}
/> -->
{/if}