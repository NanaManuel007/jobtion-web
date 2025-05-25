<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import type { JobResponse } from '$lib/services/job_services/job.type';

    export let showDialog = false;
    export let job: JobResponse | null = null;
    export let onClose = () => {};

    let selectedTab: 'jobDetails' | 'applicants' = 'jobDetails';

    // Format date to a more readable format
    function formatDate(dateString: string) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format currency
    function formatCurrency(amount: number) {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP'
        }).format(amount);
    }
</script>

{#if showDialog && job}
    <div
       tabindex="-1"
        role="dialog"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
        transition:fade
        on:click={onClose}
        on:keydown={(e) => e.key === 'Escape' && onClose()}
    >
        <div
            role="dialog" 
            tabindex="-1"
            on:keydown={() => {}}
            class="bg-white rounded-2xl w-full max-w-7xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
            transition:fly={{ y: 20, duration: 300 }}
            on:click|stopPropagation
        >
            <!-- Header -->
            <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 class="text-xl font-bold text-gray-800">Job Details: {job.job_title}</h2>
                <button 
                    class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    on:click={onClose}
                >
                    <span class="material-icons-sharp text-gray-600">close</span>
                </button>
            </div>

            <!-- Tab Navigation -->
            <div class="px-6 pt-4 border-b border-gray-100">
                <div class="flex gap-4">
                    <button
                        class="px-4 py-2 font-medium border-b-2 transition-colors {selectedTab === 'jobDetails' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
                        on:click={() => selectedTab = 'jobDetails'}
                    >
                        Job Details
                    </button>
                    <button
                        class="px-4 py-2 font-medium border-b-2 transition-colors {selectedTab === 'applicants' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}"
                        on:click={() => selectedTab = 'applicants'}
                    >
                        Applicants
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-6">
                {#if selectedTab === 'jobDetails'}
                    <div class="space-y-6">
                        <!-- Basic Job Information -->
                        <div class="bg-gray-50 p-6 rounded-xl">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p class="text-sm text-gray-500">Job Title</p>
                                    <p class="font-medium text-gray-800">{job.job_title}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Location</p>
                                    <p class="font-medium text-gray-800">{job.job_location || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Job Type</p>
                                    <p class="font-medium text-gray-800">{job.job_type}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Employment Type</p>
                                    <p class="font-medium text-gray-800">{job.employment_type || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Status</p>
                                    <span class="px-3 py-1 rounded-full text-sm font-medium inline-block
                                        {job.publish === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                        {job.publish === 1 ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Posted Date</p>
                                    <p class="font-medium text-gray-800">{formatDate(job.posted_start_date)}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Available Roles</p>
                                    <p class="font-medium text-gray-800">{job.posted_roles || 0}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Payment</p>
                                    <p class="font-medium text-gray-800">
                                        {job.payment_type}: {formatCurrency(job.amount || 0)}
                                        {#if job.job_type === 'Temporary'}
                                            per hour
                                        {/if}
                                    </p>
                                </div>
                                {#if job.job_type === 'Temporary'}
                                    <div>
                                        <p class="text-sm text-gray-500">Hours</p>
                                        <p class="font-medium text-gray-800">{job.hours || 'Not specified'}</p>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Job Duties -->
                        <div class="bg-gray-50 p-6 rounded-xl">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Job Duties</h3>
                            <ul class="list-disc pl-5 space-y-2">
                                {#if job.duty_1}
                                    <li class="text-gray-700">{job.duty_1}</li>
                                {/if}
                                {#if job.duty_2}
                                    <li class="text-gray-700">{job.duty_2}</li>
                                {/if}
                                {#if job.duty_3}
                                    <li class="text-gray-700">{job.duty_3}</li>
                                {/if}
                                {#if job.duty_4}
                                    <li class="text-gray-700">{job.duty_4}</li>
                                {/if}
                                {#if !job.duty_1 && !job.duty_2 && !job.duty_3 && !job.duty_4}
                                    <li class="text-gray-500 italic">No duties specified</li>
                                {/if}
                            </ul>
                        </div>

                        <!-- Job Requirements -->
                        <div class="bg-gray-50 p-6 rounded-xl">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Job Requirements</h3>
                            <ul class="list-disc pl-5 space-y-2">
                                {#if job.requirment_1}
                                    <li class="text-gray-700">{job.requirment_1}</li>
                                {/if}
                                {#if job.requirment_2}
                                    <li class="text-gray-700">{job.requirment_2}</li>
                                {/if}
                                {#if job.requirment_3}
                                    <li class="text-gray-700">{job.requirment_3}</li>
                                {/if}
                                {#if job.requirment_4}
                                    <li class="text-gray-700">{job.requirment_4}</li>
                                {/if}
                                {#if !job.requirment_1 && !job.requirment_2 && !job.requirment_3 && !job.requirment_4}
                                    <li class="text-gray-500 italic">No requirements specified</li>
                                {/if}
                            </ul>
                        </div>
                    </div>
                {:else if selectedTab === 'applicants'}
                    <div class="space-y-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Applicants for this Job</h3>
                        
                        {#if job.applications && job.applications.length > 0}
                            <div class="bg-white shadow-sm rounded-xl overflow-hidden">
                                <table class="w-full">
                                    <thead>
                                        <tr class="bg-gray-50">
                                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Application Id</th>
                                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each job.applications as applicant, i}
                                            <tr 
                                                class="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                                in:fly|local={{ y: 20, duration: 300, delay: i * 100 }}
                                            >
                                            <td class="px-6 py-4 text-gray-600">{applicant.app_id || 'N/A'}</td>

                                                <td class="px-6 py-4">
                                                    <div class="flex items-center">
                                                        <span class="material-icons-sharp text-gray-400 mr-2">person</span>
                                                        <span class="font-medium text-gray-800">{applicant.first_name +" "+ applicant.last_name}</span>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 text-gray-600">{applicant.email}</td>
                                                <td class="px-6 py-4">
                                                    <span class="px-3 py-1 rounded-full text-sm font-medium
                                                        {applicant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}">
                                                        {applicant.status}
                                                    </span>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                                        View 
                                                    </span>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {:else}
                            <div class="bg-gray-50 p-8 rounded-xl text-center">
                                <span class="material-icons-sharp text-gray-400 text-5xl mb-2">person_search</span>
                                <p class="text-gray-600">No applicants have applied for this job yet.</p>
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}