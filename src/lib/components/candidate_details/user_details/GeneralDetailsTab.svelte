<script lang="ts">
    import { fly } from 'svelte/transition';
    import type { Candidate} from '$lib/services/candidate_services/candidate.type';

    import CircularProgress from '../../client_details/CircularProgress.svelte';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
    export let candidate: Candidate;
    let isVerifying = false;
    let verificationMessage = '';
    let showMessage = false;
    const getStatusColor = (status: number) => {
        return status === 1
            ? 'bg-[#86e49d] text-[#006b21]' 
            : 'bg-[#d893a3] text-[#b30021]';
    };

    const statistics = [
        { label: 'Jobs Applied', value: 15, percentage: 75, color: '#6366f1' },
        { label: 'Active Jobs', value: 3, percentage: 60, color: '#22c55e' },
        { label: 'Completed Jobs', value: 8, percentage: 80, color: '#3b82f6' }
    ];

    async function toggleVerification() {
        if (!candidate || isVerifying) return;
        
        isVerifying = true;
        // Toggle between 1 (verified) and 0 (pending)
        const newStatus = candidate.adminVerification === 1 ? 0 : 1;
        
        try {
            const result = await candidateStore.verifyCandidate(candidate.id, newStatus);
            if (result.success) {
                verificationMessage = result.message || `Candidate ${newStatus === 1 ? 'verified' : 'unverified'} successfully`;
            } else {
                verificationMessage = result.message || 'Verification failed';
            }
            showMessage = true;
            setTimeout(() => {
                showMessage = false;
            }, 3000);
        } catch (error) {
            verificationMessage = 'An error occurred during verification';
            showMessage = true;
            setTimeout(() => {
                showMessage = false;
            }, 3000);
        } finally {
            isVerifying = false;
        }
    }
</script>

<div 
    class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] p-8"
    in:fly={{ x: 100, duration: 800, delay: 300 }}
>
    <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            <img src={candidate.profilePicture !==null ?"https://node.jobtiondevs.com/"+candidate.profilePicture : '/user_images/default.jpg'} alt={`${candidate.firstName} ${candidate.lastName}`} class="w-full h-full object-cover">
        </div>
        <div>
            <h3 class="text-3xl font-bold text-gray-800 mb-2">{candidate?.firstName} {candidate?.lastName !==null? candidate?.lastName : ""}</h3>
            <p class="text-gray-600 flex items-center gap-2">
                <span class="material-icons-sharp text-sm">location_on</span>
                {candidate?.address === null || ""? "Location Not Set": candidate?.address}
            </p>
        </div>
        <div class="ml-auto flex items-center gap-3">
            <span class="px-4 py-2 rounded-full {getStatusColor(candidate?.adminVerification)} font-medium">
                {candidate?.adminVerification ===1 ? 'Admin Verified' : 'Admin V. Pending'}
            </span>
            <button 
                on:click={toggleVerification}
                class="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifying}
            >
                {#if isVerifying}
                    <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {:else}
                    <span class="material-icons-sharp text-sm">
                        {candidate?.adminVerification === 1 ? 'cancel' : 'check_circle'}
                    </span>
                {/if}
                {candidate?.adminVerification === 1 ? 'Unverify' : 'Verify'}
            </button>
        </div>
    </div>

    <div class="grid grid-cols-2 gap-8">
        <!-- Personal Information -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 400 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Personal Information</h4>
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">person</span>
                    <div>
                        <p class="text-sm text-gray-500">Full Name</p>
                        <p class="text-gray-800 font-medium">{candidate?.firstName +" " }{ candidate?.lastName === null || "" ?"": candidate?.lastName}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">calendar_today</span>
                    <div>
                        <p class="text-sm text-gray-500">Date Joined</p>
                        <p class="text-gray-800 font-medium">{candidate?.createdAt.substring(0,10)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">work</span>
                    <div>
                        <p class="text-sm text-gray-500">Email Verification (User Verification)</p>
                        <p class="text-gray-800 font-medium"> 
                            {candidate?.email ? 'Verified' : 'Pending Verification'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div 
            class="space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 500 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Contact Information</h4>
            <div class="space-y-4">
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">email</span>
                    <div>
                        <p class="text-sm text-gray-500">Email</p>
                        <p class="text-gray-800 font-medium">{candidate?.email} </p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">phone</span>
                    <div>
                        <p class="text-sm text-gray-500">Phone Number</p>
                        <p class="text-gray-800 font-medium">{candidate?.phoneNumber}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="material-icons-sharp text-gray-600">location_on</span>
                    <div>
                        <p class="text-sm text-gray-500">Location</p>
                        <p class="text-gray-800 font-medium">{candidate?.address === null || ""? "Location Not Set": candidate?.address}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div 
            class="col-span-2 space-y-6 p-6 bg-gray-50 rounded-xl"
            in:fly={{ x: 100, duration: 800, delay: 600 }}
        >
            <h4 class="text-xl font-semibold text-gray-800 mb-4">Job Statistics</h4>
            <div class="grid grid-cols-3 gap-6">
                {#each statistics as stat}
                    <CircularProgress 
                        percentage={stat.percentage}
                        color={stat.color}
                        label={stat.label}
                        value={stat.value}
                    />
                {/each}
            </div>
        </div>
    </div>
</div>