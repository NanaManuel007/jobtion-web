<script lang="ts">
    import { fade } from 'svelte/transition';
    import { createEventDispatcher } from 'svelte';
    import type { InternalJobCreateRequest, InternalJobAPI } from '$lib/services/job_services/job.type';
    import { jobActions } from '$lib/services/job_services/job.store';
    import Toast from '$lib/components/general_components/Toast.svelte';

    const dispatch = createEventDispatcher();
    const { clientId, showDialog = $bindable(false), isEditMode = $bindable(false), jobToEdit = $bindable(null) } = $props<{
        clientId: string,
        showDialog?: boolean,
        isEditMode?: boolean,
        jobToEdit?: InternalJobAPI | null
    }>();

    let toastShow = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');
    let isLoading = $state(false);
    let errors = $state<{ [key: string]: string }>({});

    let jobData = $state<InternalJobCreateRequest>({
        jobTitle: '',
        paymentType: '',
        jobType: 'Permanent',
        employmentType: '',
        jobLocation: '',
        longitude: 0,
        latitude: 0,
        hours: 0,
        duty1: '',
        duty2: '',
        duty3: '',
        duty4: '',
        requirement1: '',
        requirement2: '',
        requirement3: '',
        requirement4: '',
        position: '',
        jobDescription: '',
        jobRequirement: '',
        companyName: '',
        postedStartDate: new Date().toISOString().split('T')[0],
        jobStartDate: new Date().toISOString().split('T')[0],
        jobCloseDate: new Date().toISOString().split('T')[0],
        requiredLevel: ''
    });

    // Reset form when dialog closes
    $effect(() => {
        if (!showDialog) {
            jobData = {
                jobTitle: '',
                paymentType: '',
                jobType: 'Permanent',
                employmentType: '',
                jobLocation: '',
                longitude: 0,
                latitude: 0,
                hours: 0,
                duty1: '',
                duty2: '',
                duty3: '',
                duty4: '',
                requirement1: '',
                requirement2: '',
                requirement3: '',
                requirement4: '',
                position: '',
                jobDescription: '',
                jobRequirement: '',
                companyName: '',
                postedStartDate: new Date().toISOString().split('T')[0],
                jobStartDate: new Date().toISOString().split('T')[0],
                jobCloseDate: new Date().toISOString().split('T')[0],
                requiredLevel: ''
            };
            errors = {};
        }
    });

    // Initialize edit mode
    $effect(() => {
        if (isEditMode && jobToEdit) {
            jobData = {
                jobTitle: jobToEdit.jobTitle || '',
                paymentType: jobToEdit.paymentType || '',
                jobType: jobToEdit.jobType || 'Permanent',
                employmentType: jobToEdit.employmentType || '',
                jobLocation: jobToEdit.jobLocation || '',
                longitude: jobToEdit.longitude || 0,
                latitude: jobToEdit.latitude || 0,
                hours: jobToEdit.hours || 0,
                duty1: jobToEdit.duty1 || '',
                duty2: jobToEdit.duty2 || '',
                duty3: jobToEdit.duty3 || '',
                duty4: jobToEdit.duty4 || '',
                requirement1: jobToEdit.requirement1 || '',
                requirement2: jobToEdit.requirement2 || '',
                requirement3: jobToEdit.requirement3 || '',
                requirement4: jobToEdit.requirement4 || '',
                position: jobToEdit.position || '',
                jobDescription: jobToEdit.jobDescription || '',
                jobRequirement: jobToEdit.jobRequirement || '',
                companyName: jobToEdit.companyName || '',
                postedStartDate: jobToEdit.postedStartDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                jobStartDate: jobToEdit.jobStartDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                jobCloseDate: jobToEdit.jobCloseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                requiredLevel: jobToEdit.requiredLevel || ''
            };
        }
    });

    function validateForm() {
        errors = {};
        let isValid = true;

        if (!jobData.jobTitle.trim()) {
            errors.jobTitle = 'Job title is required';
            isValid = false;
        }
        if (!jobData.companyName.trim()) {
            errors.companyName = 'Company name is required';
            isValid = false;
        }
        if (!jobData.paymentType.trim()) {
            errors.paymentType = 'Payment type is required';
            isValid = false;
        }
        if (!jobData.employmentType.trim()) {
            errors.employmentType = 'Employment type is required';
            isValid = false;
        }
        if (!jobData.jobLocation.trim()) {
            errors.jobLocation = 'Job location is required';
            isValid = false;
        }
        if (!jobData.duty1.trim()) {
            errors.duty1 = 'At least one duty is required';
            isValid = false;
        }
        if (!jobData.requirement1.trim()) {
            errors.requirement1 = 'At least one requirement is required';
            isValid = false;
        }
        if (!jobData.requiredLevel.trim()) {
            errors.requiredLevel = 'Required level is required';
            isValid = false;
        }

        return isValid;
    }

    async function handleSubmit(event: Event) {
        event.preventDefault();
        
        const isValid = validateForm();
        if (!isValid) {
            toastType = 'error';
            toastMessage = Object.values(errors).join(', ');
            toastShow = true;
            return;
        }
    
        try {
            isLoading = true;
            
            // Convert date strings to ISO format with timezone
            const formattedJobData = {
                ...jobData,
                postedStartDate: new Date(jobData.postedStartDate + 'T00:00:00.000Z').toISOString(),
                jobStartDate: new Date(jobData.jobStartDate + 'T00:00:00.000Z').toISOString(),
                jobCloseDate: new Date(jobData.jobCloseDate + 'T00:00:00.000Z').toISOString()
            };
            
            if (isEditMode && jobToEdit) {
                await jobActions.updateInternalJob(jobToEdit.id, formattedJobData, clientId);
                toastMessage = 'Internal job updated successfully';
            } else {
                await jobActions.addInternalJob(formattedJobData, clientId);
                toastMessage = 'Internal job added successfully';
            }
            
            toastType = 'success';
            toastShow = true;
            dispatch('addInternalJob', { jobData: formattedJobData });
            dispatch('close');
        } catch (error) {
            console.error('Error submitting internal job:', error);
            toastType = 'error';
            toastMessage = 'Failed to save internal job: ' + (error instanceof Error ? error.message : 'Unknown error');
            toastShow = true;
        } finally {
            isLoading = false;
        }
    }
</script>

{#if showDialog}
<div class="fixed inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-50" transition:fade>
    <Toast 
        bind:show={toastShow}
        message={toastMessage}
        type={toastType}
    />
    <div class="bg-white rounded-[15px] px-8 w-[1200px] max-h-[90vh] overflow-y-auto shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] relative">
        <form on:submit|preventDefault={handleSubmit}>
            <div class="sticky top-0 bg-white z-10 py-6 border-b border-gray-100">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Internal Job' : 'Add New Internal Job'}</h2>
                    <div class="flex justify-end gap-4">
                        <button
                            type="button"
                            class="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            on:click={() => { dispatch('close'); }}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            class="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isLoading}
                        >
                            {#if isLoading}
                                <span class="material-icons-sharp animate-spin text-sm">refresh</span>
                            {/if}
                            {isLoading ? (isEditMode ? "Updating Internal Job..." : "Adding Internal Job...") : (isEditMode ? "Update Internal Job" : "Add Internal Job")}
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex gap-8 pb-10 pt-5">
                <div class="flex-1">
                    <div class="space-y-6">
                        <!-- Basic Information -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                                    <input
                                        type="text"
                                        bind:value={jobData.jobTitle}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.jobTitle ? 'border-red-500' : ''}"
                                        placeholder="Enter job title"
                                    />
                                    {#if errors.jobTitle}
                                        <p class="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                    <input
                                        type="text"
                                        bind:value={jobData.companyName}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.companyName ? 'border-red-500' : ''}"
                                        placeholder="Enter company name"
                                    />
                                    {#if errors.companyName}
                                        <p class="text-red-500 text-sm mt-1">{errors.companyName}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Location *</label>
                                    <input
                                        type="text"
                                        bind:value={jobData.jobLocation}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.jobLocation ? 'border-red-500' : ''}"
                                        placeholder="Enter job location"
                                    />
                                    {#if errors.jobLocation}
                                        <p class="text-red-500 text-sm mt-1">{errors.jobLocation}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Required Level *</label>
                                    <select
                                        bind:value={jobData.requiredLevel}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.requiredLevel ? 'border-red-500' : ''}"
                                    >
                                        <option value="">Select required level</option>
                                        <option value="Entry Level">Entry Level</option>
                                        <option value="Mid Level">Mid Level</option>
                                        <option value="Senior Level">Senior Level</option>
                                        <option value="Executive Level">Executive Level</option>
                                    </select>
                                    {#if errors.requiredLevel}
                                        <p class="text-red-500 text-sm mt-1">{errors.requiredLevel}</p>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <!-- Job Details -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Job Details</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                                    <select
                                        bind:value={jobData.jobType}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Permanent">Permanent</option>
                                        <option value="Temporary">Temporary</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                                    <select
                                        bind:value={jobData.employmentType}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.employmentType ? 'border-red-500' : ''}"
                                    >
                                        <option value="">Select employment type</option>
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Freelance">Freelance</option>
                                    </select>
                                    {#if errors.employmentType}
                                        <p class="text-red-500 text-sm mt-1">{errors.employmentType}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Payment Type *</label>
                                    <select
                                        bind:value={jobData.paymentType}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.paymentType ? 'border-red-500' : ''}"
                                    >
                                        <option value="">Select payment type</option>
                                        <option value="Hourly">Hourly</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                    {#if errors.paymentType}
                                        <p class="text-red-500 text-sm mt-1">{errors.paymentType}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
                                    <input
                                        type="number"
                                        bind:value={jobData.hours}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter hours per week"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Dates -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Important Dates</h3>
                            <div class="grid grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Posted Start Date</label>
                                    <input
                                        type="date"
                                        bind:value={jobData.postedStartDate}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Start Date</label>
                                    <input
                                        type="date"
                                        bind:value={jobData.jobStartDate}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Close Date</label>
                                    <input
                                        type="date"
                                        bind:value={jobData.jobCloseDate}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Job Duties -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Job Duties</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Duty 1 *</label>
                                    <textarea
                                        bind:value={jobData.duty1}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.duty1 ? 'border-red-500' : ''}"
                                        placeholder="Enter first duty"
                                        rows="2"
                                    ></textarea>
                                    {#if errors.duty1}
                                        <p class="text-red-500 text-sm mt-1">{errors.duty1}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Duty 2</label>
                                    <textarea
                                        bind:value={jobData.duty2}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter second duty (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Duty 3</label>
                                    <textarea
                                        bind:value={jobData.duty3}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter third duty (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Duty 4</label>
                                    <textarea
                                        bind:value={jobData.duty4}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter fourth duty (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Job Requirements -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Job Requirements</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Requirement 1 *</label>
                                    <textarea
                                        bind:value={jobData.requirement1}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.requirement1 ? 'border-red-500' : ''}"
                                        placeholder="Enter first requirement"
                                        rows="2"
                                    ></textarea>
                                    {#if errors.requirement1}
                                        <p class="text-red-500 text-sm mt-1">{errors.requirement1}</p>
                                    {/if}
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Requirement 2</label>
                                    <textarea
                                        bind:value={jobData.requirement2}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter second requirement (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Requirement 3</label>
                                    <textarea
                                        bind:value={jobData.requirement3}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter third requirement (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Requirement 4</label>
                                    <textarea
                                        bind:value={jobData.requirement4}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter fourth requirement (optional)"
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Additional Information -->
                        <div class="bg-gray-50 p-6 rounded-lg">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
                                    <input
                                        type="text"
                                        bind:value={jobData.position}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter position details"
                                    />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                    <textarea
                                        bind:value={jobData.jobDescription}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter detailed job description"
                                        rows="4"
                                    ></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Job Requirement Summary</label>
                                    <textarea
                                        bind:value={jobData.jobRequirement}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter job requirement summary"
                                        rows="4"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
{/if}