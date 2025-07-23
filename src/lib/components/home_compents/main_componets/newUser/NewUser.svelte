<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';

    let verifiedCandidates: Array<{
        name: string;
        time: string;
        image: string;
        candidateId: number;
    }> = [];

    onMount(async () => {
        await candidateStore.fetchCandidates({ pageSize: 10000 });
        const candidates = $candidateStore.candidates
            .filter(candidate => candidate.isEmailVerified === true)
            .slice(0, 5)
            .map(candidate => ({
                name: `${candidate.firstName} ${candidate.lastName || ''}`.trim(),
                time: candidate.createdAt,
                image: candidate.profilePictureUrl ,
                candidateId: candidate.id
            }));
        verifiedCandidates = candidates;
    });

    function formatTime(date: Date): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 60) {
            return `${diffMins} Min Ago`;
        } else {
            return `${diffHours} Hours Ago`;
        }
    }

    function handleViewMore() {
        goto('/private/all_candidates');
    }
    function handleView(candidateId: number) {
        goto(`/private/all_candidates/candidate_details/${candidateId}`);
    }

</script>

<div class="rounded-xl">
    <h2 class="text-lg font-semibold mb-4">New Verified Users</h2>
    <div class=" bg-white pt-5 pb-5 pl-5 pr-5 sm:pl-10 sm:pr-10 rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)]
                transition-all duration-300 ">
        <div class="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-6">
            {#each verifiedCandidates as user}
                <div class="flex flex-col items-center cursor-pointer"
                onclick={() => handleView(user.candidateId)}
                >
                    <img class= "w-16 h-16 rounded-full object-cover "
                     src={user.image !==null ?"https://minio-kogckgccwg40sgkksc4k4o4w.46.202.141.196.sslip.io/jobtion/"+user.image : 
                     '/user_images/default.jpg'} alt={`${user.name}`} >

                    <!-- <img class="w-16 h-16 rounded-full object-cover" src={user.image} alt={user.name} /> -->
                    <p class="mt-2 font-semibold text-gray-900">{user.name}</p>
                    <p class="text-sm text-gray-500">{user.time.substring(0,10)}</p>
                </div>
            {/each}
            <button 
            onclick={handleViewMore}
            class="flex flex-col items-center cursor-pointer">
                <div class="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-full">
                    <span class="text-3xl text-gray-500 material-icons">visibility</span>
                </div>
                <p class="mt-2 font-semibold text-gray-900">View</p>
                <p class="text-sm text-gray-500">All Users</p>
            </button>
        </div>
    </div>
</div>