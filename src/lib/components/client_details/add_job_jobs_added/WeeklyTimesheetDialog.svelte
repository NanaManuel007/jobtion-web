<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import Toast from '$lib/components/general_components/Toast.svelte';
    import type { 
        InternalJobAPI, 
        WeeklyTimesheetCreateRequest,
        DayTimesheet 
    } from '$lib/services/job_services/job.type';
    import type { Candidate, DetailedCandidate } from '$lib/services/candidate_services/candidate.types';
    import { JobService } from '$lib/services/job_services/job.services';
    import { CandidateService } from '$lib/services/candidate_services/candidate.services';
    // Add qualification imports
    import { qualificationTypes, isQualificationTypesLoading } from '$lib/services/job_services/job.store';
    import { jobActions } from '$lib/services/job_services/job.store';

    export let isOpen = false;
    export let clientId: string = ''; // Make clientId optional with default empty string

    const dispatch = createEventDispatcher();

    let candidates: Candidate[] = [];
    let internalJobs: InternalJobAPI[] = [];
    let selectedCandidate: Candidate | null = null;
    let selectedJob: InternalJobAPI | null = null;
    
    // Search states
    let candidateSearch = '';
    let jobSearchTerm = '';
    // Add qualification filter state
    let selectedQualificationCode = '';
    let selectedCandidateQualificationCode = ''; // Add candidate qualification filter
    
    // Toast state
    let showToast = false;
    let toastMessage = '';
    let toastType: 'success' | 'error' = 'success';
    
    // Pagination states
    let candidatesPage = 1;
    let jobsPage = 1;
    let candidatesTotal = 0;
    let jobsTotal = 0;
    let candidatesLoading = false;
    let jobsLoading = false;
    let submitting = false;

    // Current step in the wizard
    let currentStep = 1;
    const totalSteps = 3;

    // Timesheet data
    let weekStartDate = '';
    // Add this new state variable for selected days
    let selectedDays: Set<string> = new Set();
    let timesheetData: WeeklyTimesheetCreateRequest = {
        weekStartDate: '',
        monday: createEmptyDayTimesheet(),
        tuesday: createEmptyDayTimesheet(),
        wednesday: createEmptyDayTimesheet(),
        thursday: createEmptyDayTimesheet(),
        friday: createEmptyDayTimesheet(),
        saturday: createEmptyDayTimesheet(),
        sunday: createEmptyDayTimesheet()
    };

    const daysOfWeek = [
        { key: 'monday', label: 'Monday' },
        { key: 'tuesday', label: 'Tuesday' },
        { key: 'wednesday', label: 'Wednesday' },
        { key: 'thursday', label: 'Thursday' },
        { key: 'friday', label: 'Friday' },
        { key: 'saturday', label: 'Saturday' },
        { key: 'sunday', label: 'Sunday' }
    ];

    function createEmptyDayTimesheet(): DayTimesheet {
        return {
            workDate: '',
            start: '09:00',
            finish: '17:00',
            break: '01:00',
            expense: 0,
            miles: 0,
            rating: 5,
            notes: '',
            longitude: 0,
            latitude: 0
        };
    }

    function showSuccessToast(message: string) {
        toastMessage = message;
        toastType = 'success';
        showToast = true;
    }

    function showErrorToast(message: string) {
        toastMessage = message;
        toastType = 'error';
        showToast = true;
    }

    async function loadCandidates() {
        candidatesLoading = true;
        try {
            // Get the selected qualification's readable name for filtering
            let qualificationReadableName = undefined;
            if (selectedCandidateQualificationCode.trim()) {
                const selectedQualification = $qualificationTypes.find(q => q.qualificationTypeCode === selectedCandidateQualificationCode);
                qualificationReadableName = selectedQualification?.readableName;
            }

            // Use CandidateService with qualification filtering
            const response = await CandidateService.getAllCandidates({
                page: candidatesPage,
                pageSize: 10,
                isEmailVerified: true,
                isActive: true,
                search: candidateSearch.trim() || undefined,
                qualificationReadableName: qualificationReadableName
            });
            
            candidates = response.data?.items || [];
            candidatesTotal = response.data?.totalCount || 0;
        } catch (error) {
            candidates = [];
            candidatesTotal = 0;
            showErrorToast('Failed to load candidates');
            console.error('Error loading candidates:', error);
        } finally {
            candidatesLoading = false;
        }
    }

    async function loadInternalJobs() {
        jobsLoading = true;
        try {
            let response;
            
            // Use different service methods based on whether clientId is provided
            if (clientId && clientId.trim() !== '') {
                // Client-specific jobs for regular client context
                response = await JobService.getInternalJobs(clientId, jobsPage, 10);
            } else {
                // All internal jobs for approval context
                response = await JobService.getAllInternalJobs(jobsPage, 10, jobSearchTerm.trim() || undefined);
            }
            
            let jobList = response.data?.jobs || [];
            
            // Apply search filter if search term exists and we're using client-specific method
            if (jobSearchTerm.trim() && clientId && clientId.trim() !== '') {
                jobList = jobList.filter(job => 
                    job.jobTitle.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                    job.jobLocation.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                    job.companyName.toLowerCase().includes(jobSearchTerm.toLowerCase())
                );
            }
            
            // Apply qualification filter
            if (selectedQualificationCode.trim()) {
                jobList = jobList.filter(job => 
                    job.qualificationTypeCode === selectedQualificationCode
                );
            }
            
            internalJobs = jobList;
            jobsTotal = jobList.length;
        } catch (error) {
            internalJobs = [];
            jobsTotal = 0;
            showErrorToast('Failed to load internal jobs');
            console.error('Error loading internal jobs:', error);
        } finally {
            jobsLoading = false;
        }
    }

    // Function to handle candidate search
    function handleCandidateSearch() {
        candidatesPage = 1; // Reset to first page when searching
        loadCandidates();
    }

    // Function to handle job search
    function handleJobSearch() {
        jobsPage = 1; // Reset to first page when searching
        loadInternalJobs();
    }

    // Function to handle qualification filter
    function handleQualificationFilter() {
        jobsPage = 1; // Reset to first page when filtering
        loadInternalJobs();
    }

    // Function to handle candidate qualification filter
    function handleCandidateQualificationFilter() {
        candidatesPage = 1; // Reset to first page when filtering
        loadCandidates();
    }

    // function calculateWorkDate(dayKey: string): string {
    //     if (!weekStartDate) return '';
    //     const startDate = new Date(weekStartDate);
    //     const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    //     const workDate = new Date(startDate);
    //     workDate.setDate(startDate.getDate() + dayIndex);
    //     return workDate.toISOString().split('T')[0];
    // }

    function calculateWorkDate(dayKey: string): string {
    if (!weekStartDate) return '';
    
    // Get the selected date
    const selectedDate = new Date(weekStartDate);
    
    // Find the Monday of the week containing the selected date
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as last day of week
    
    const monday = new Date(selectedDate);
    monday.setDate(selectedDate.getDate() + mondayOffset);
    
    // Calculate the target day from Monday
    const dayIndex = daysOfWeek.findIndex(d => d.key === dayKey);
    const workDate = new Date(monday);
    workDate.setDate(monday.getDate() + dayIndex);
    
    return workDate.toISOString().split('T')[0];
}

    function updateAllWorkDates() {
        if (weekStartDate) {
            daysOfWeek.forEach(day => {
                (timesheetData as any)[day.key].workDate = calculateWorkDate(day.key);
            });
        }
    }

    function applyToAllDays(field: keyof DayTimesheet, value: any) {
        daysOfWeek.forEach(day => {
            if (field !== 'workDate') {
                (timesheetData as any)[day.key][field] = value;
            }
        });
        timesheetData = { ...timesheetData }; // Trigger reactivity
    }

    function toggleDaySelection(dayKey: string) {
        if (selectedDays.has(dayKey)) {
            selectedDays.delete(dayKey);
        } else {
            selectedDays.add(dayKey);
        }
        selectedDays = new Set(selectedDays); // Trigger reactivity
    }

    function selectAllDays() {
        selectedDays = new Set(daysOfWeek.map(day => day.key));
    }

    function clearAllDays() {
        selectedDays = new Set();
    }

    function applyToSelectedDays(field: keyof DayTimesheet, value: any) {
        selectedDays.forEach(dayKey => {
            if (field !== 'workDate') {
                timesheetData[dayKey][field] = value;
            }
        });
        timesheetData = { ...timesheetData }; // Trigger reactivity
    }

    // Update the handleSubmit function
    async function handleSubmit() {
        if (!selectedCandidate || !selectedJob) {
            showErrorToast('Please select both a candidate and a job');
            return;
        }

        if (!weekStartDate) {
            showErrorToast('Please select a week start date');
            return;
        }

        if (selectedDays.size === 0) {
            showErrorToast('Please select at least one day');
            return;
        }

        submitting = true;
        try {
            timesheetData.weekStartDate = weekStartDate;
            updateAllWorkDates();
            
            // Create a filtered timesheet data with only selected days
            const filteredTimesheetData: any = {
                weekStartDate: weekStartDate
            };
            
            selectedDays.forEach(dayKey => {
                filteredTimesheetData[dayKey] = timesheetData[dayKey];
            });
            
            await JobService.createWeeklyTimesheet(
                selectedJob.id,
                selectedCandidate.id,
                filteredTimesheetData
            );
            
            showSuccessToast('Weekly timesheet created successfully');
            dispatch('timesheetCreated');
            closeDialog();
        } catch (error) {
            showErrorToast('Failed to create weekly timesheet');
            console.error('Error creating timesheet:', error);
        } finally {
            submitting = false;
        }
    }

    // Update closeDialog to reset selectedDays
    function closeDialog() {
        isOpen = false;
        currentStep = 1;
        selectedCandidate = null;
        selectedJob = null;
        selectedDays = new Set();
        timesheetData = {
            weekStartDate: '',
            monday: createEmptyDayTimesheet(),
            tuesday: createEmptyDayTimesheet(),
            wednesday: createEmptyDayTimesheet(),
            thursday: createEmptyDayTimesheet(),
            friday: createEmptyDayTimesheet(),
            saturday: createEmptyDayTimesheet(),
            sunday: createEmptyDayTimesheet()
        };
        weekStartDate = '';
    }

    // Add new state variables for detailed candidate data
    let selectedCandidateDetails: DetailedCandidate | null = null;
    let candidateDetailsLoading = false;

    // Add validation state
    let validationErrors: string[] = [];

    // Add state variables for editing candidate charges
    let isEditingCharges = false;
    let editedPayment = 0;
    let editedTemporaryCharge = 0;
    let editedTemporaryChargeActive = false;
    let savingCharges = false;

    // Function to start editing charges
    function startEditingCharges() {
        if (selectedCandidateDetails?.paymentModel) {
            editedPayment = selectedCandidateDetails.paymentModel.payment;
            editedTemporaryCharge = selectedCandidateDetails.paymentModel.temporaryCharge;
            editedTemporaryChargeActive = selectedCandidateDetails.paymentModel.temporaryChargeActive || false;
            isEditingCharges = true;
        }
    }

    // Function to cancel editing charges
    function cancelEditingCharges() {
        isEditingCharges = false;
        editedPayment = 0;
        editedTemporaryCharge = 0;
        editedTemporaryChargeActive = false;
    }

    // Function to save candidate charges
    async function saveCandidateCharges() {
        if (!selectedCandidate || !selectedCandidateDetails) {
            showErrorToast('No candidate selected');
            return;
        }

        // Validate input values
        if (editedPayment <= 0) {
            showErrorToast('Base payment must be greater than 0');
            return;
        }
        if (editedTemporaryCharge <= 0) {
            showErrorToast('Temporary charge must be greater than 0');
            return;
        }

        savingCharges = true;
        try {
            // Update the payment model
            const updatedPaymentModel = {
                ...selectedCandidateDetails.paymentModel,
                payment: editedPayment,
                temporaryCharge: editedTemporaryCharge,
                temporaryChargeActive: editedTemporaryChargeActive
            };

            // Call the service to update candidate payment model
            await CandidateService.updatePaymentModel(selectedCandidate.id, updatedPaymentModel);
            
            // Update local state
            selectedCandidateDetails.paymentModel = updatedPaymentModel;
            isEditingCharges = false;
            
            showSuccessToast('Candidate charges updated successfully');
        } catch (error) {
            console.error('Error updating candidate charges:', error);
            showErrorToast('Failed to update candidate charges');
        } finally {
            savingCharges = false;
        }
    }

    // Add function to fetch detailed candidate information
    async function fetchCandidateDetails(candidateId: string) {
        candidateDetailsLoading = true;
        validationErrors = [];
        try {
            const response = await CandidateService.getSingleCandidate(candidateId);
            selectedCandidateDetails = response.data;
        } catch (error) {
            console.error('Error fetching candidate details:', error);
            showErrorToast('Failed to load candidate details');
            selectedCandidateDetails = null;
        } finally {
            candidateDetailsLoading = false;
        }
    }

    // Add validation function for bank details and payment model
    function validateCandidateRequirements(): boolean {
        validationErrors = [];
        
        if (!selectedCandidateDetails) {
            validationErrors.push('Candidate details not loaded');
            return false;
        }
        
        // Check if bank details exist and are verified
        if (!selectedCandidateDetails.bankDetails) {
            validationErrors.push('Candidate does not have bank details configured');
        } else if (!selectedCandidateDetails.bankDetails.isVerified) {
            validationErrors.push('Candidate bank details are not verified by admin');
        }
        
        // Check if payment model exists
        if (!selectedCandidateDetails.paymentModel) {
            validationErrors.push('Candidate does not have a payment model configured');
        } else {
            // Check if payment model has required fields
            if (!selectedCandidateDetails.paymentModel.payment || selectedCandidateDetails.paymentModel.payment <= 0) {
                validationErrors.push('Candidate payment model does not have a valid payment rate');
            }
            if (!selectedCandidateDetails.paymentModel.temporaryCharge || selectedCandidateDetails.paymentModel.temporaryCharge <= 0) {
                validationErrors.push('Candidate payment model does not have a valid temporary charge rate');
            }
        }
        
        return validationErrors.length === 0;
    }

    // Update the nextStep function with validation
    function nextStep() {
        if (currentStep === 1) {
            // Validate candidate and job selection
            if (!selectedCandidate || !selectedJob) {
                showErrorToast('Please select both a candidate and a job before proceeding');
                return;
            }
            
            // Fetch candidate details and validate requirements
            fetchCandidateDetails(selectedCandidate.id).then(() => {
                if (validateCandidateRequirements()) {
                    if (currentStep < totalSteps) {
                        currentStep++;
                    }
                } else {
                    // Show validation errors
                    const errorMessage = validationErrors.join('\n• ');
                    showErrorToast(`Cannot proceed to timesheet creation:\n• ${errorMessage}`);
                }
            });
        } else {
            if (currentStep < totalSteps) {
                currentStep++;
            }
        }
    }

    // Update candidate selection to fetch details immediately
    function selectCandidate(candidate: Candidate) {
        selectedCandidate = candidate;
        fetchCandidateDetails(candidate.id);
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
        }
    }

    $: if (weekStartDate) {
        updateAllWorkDates();
    }

    onMount(() => {
        if (isOpen) {
            loadCandidates();
            loadInternalJobs();
            // Load qualifications if not already loaded
            if ($qualificationTypes.length === 0) {
                jobActions.getQualificationTypes();
            }
        }
    });

    $: if (isOpen) {
        loadCandidates();
        loadInternalJobs();
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold">Create Weekly Timesheet</h2>
                        <p class="text-blue-100 mt-1">Step {currentStep} of {totalSteps}</p>
                    </div>
                    <button 
                        on:click={closeDialog}
                        class="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                    <div class="flex space-x-2">
                        {#each Array(totalSteps) as _, i}
                            <div class="flex-1 h-2 rounded-full {i < currentStep ? 'bg-white' : 'bg-blue-400'}">
                            </div>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
                {#if currentStep === 1}
                    <!-- Step 1: Select Candidate and Job -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Candidates -->
                        <div class="space-y-4">
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Select Candidate
                            </h3>
                            
                            <!-- Candidate Search -->
                            <div class="relative">
                                <input 
                                    type="text" 
                                    bind:value={candidateSearch}
                                    on:input={handleCandidateSearch}
                                    placeholder="Search candidates by name or email..."
                                    class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            
                            <!-- Candidate Qualification Filter -->
                            <div class="relative">
                                {#if $isQualificationTypesLoading}
                                    <div class="flex items-center justify-center py-2">
                                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span class="ml-2 text-sm text-gray-600">Loading qualifications...</span>
                                    </div>
                                {:else}
                                    <select 
                                        bind:value={selectedCandidateQualificationCode}
                                        on:change={handleCandidateQualificationFilter}
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">All Qualifications</option>
                                        {#each $qualificationTypes as qualification}
                                            <option value={qualification.qualificationTypeCode}>{qualification.readableName}</option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>
                            
                            {#if candidatesLoading}
                                <div class="flex items-center justify-center py-8">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span class="ml-2 text-gray-600">Loading candidates...</span>
                                </div>
                            {:else}
                                <div class="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                                    {#each candidates as candidate}
                                        <div 
                                            class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md {selectedCandidate?.id === candidate.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}"
                                            on:click={() => selectCandidate(candidate)}
                                        >
                                            <div class="flex items-center space-x-3">
                                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                                                </div>
                                                <div class="flex-1">
                                                    <p class="font-semibold text-gray-800">{candidate.firstName} {candidate.lastName}</p>
                                                    <p class="text-sm text-gray-600">{candidate.email}</p>
                                                    <div class="flex space-x-2 mt-1">
                                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ Verified
                                                        </span>
                                                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            ✓ Active
                                                        </span>
                                                    </div>
                                                </div>
                                                {#if selectedCandidate?.id === candidate.id}
                                                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                                    </svg>
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                    
                                    {#if candidates.length === 0 && !candidatesLoading}
                                        <div class="text-center py-8 text-gray-500">
                                            {candidateSearch ? 'No candidates found matching your search.' : 'No verified and active candidates available.'}
                                        </div>
                                    {/if}
                                </div>
                                
                                <!-- Pagination -->
                                <div class="flex justify-between items-center mt-4">
                                    <button 
                                        on:click={() => { candidatesPage--; loadCandidates(); }}
                                        disabled={candidatesPage <= 1}
                                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span class="text-sm text-gray-600">Page {candidatesPage}</span>
                                    <button 
                                        on:click={() => { candidatesPage++; loadCandidates(); }}
                                        disabled={candidates.length < 10}
                                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            {/if}
                        </div>

                        <!-- Internal Jobs -->
                        <div class="space-y-4">
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                                </svg>
                                Select Internal Job
                            </h3>
                            
                            <!-- Job Search -->
                            <div class="relative">
                                <input 
                                    type="text" 
                                    bind:value={jobSearchTerm}
                                    on:input={handleJobSearch}
                                    placeholder="Search jobs by title, location, or company..."
                                    class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                />
                                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            
                            <!-- Qualification Filter -->
                            <div class="relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Qualification</label>
                                {#if $isQualificationTypesLoading}
                                    <div class="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 flex items-center">
                                        <span class="material-icons-sharp animate-spin text-sm mr-2">refresh</span>
                                        Loading qualifications...
                                    </div>
                                {:else}
                                    <select
                                        bind:value={selectedQualificationCode}
                                        on:change={handleQualificationFilter}
                                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    >
                                        <option value="">All Qualifications</option>
                                        {#each $qualificationTypes as qualification}
                                            <option value={qualification.qualificationTypeCode}>{qualification.readableName}</option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>
                            
                            {#if jobsLoading}
                                <div class="flex items-center justify-center py-8">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    <span class="ml-2 text-gray-600">Loading jobs...</span>
                                </div>
                            {:else}
                                <div class="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                                    {#each internalJobs as job}
                                        <div 
                                            class="p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md {selectedJob?.id === job.id ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}"
                                            on:click={() => selectedJob = job}
                                        >
                                            <div class="flex items-start space-x-3">
                                                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                    {job.jobTitle.charAt(0)}
                                                </div>
                                                <div class="flex-1">
                                                    <p class="font-semibold text-gray-800">{job.jobTitle}</p>
                                                    <p class="text-sm text-gray-600">{job.jobLocation}</p>
                                                    <p class="text-sm text-gray-500">{job.companyName}</p>
                                                </div>
                                                {#if selectedJob?.id === job.id}
                                                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                                    </svg>
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}
                                    
                                    {#if internalJobs.length === 0 && !jobsLoading}
                                        <div class="text-center py-8 text-gray-500">
                                            {jobSearchTerm ? 'No jobs found matching your search.' : 'No internal jobs available.'}
                                        </div>
                                    {/if}
                                </div>
                                
                                <!-- Pagination -->
                                <div class="flex justify-between items-center mt-4">
                                    <button 
                                        on:click={() => { jobsPage--; loadInternalJobs(); }}
                                        disabled={jobsPage <= 1}
                                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span class="text-sm text-gray-600">Page {jobsPage}</span>
                                    <button 
                                        on:click={() => { jobsPage++; loadInternalJobs(); }}
                                        disabled={internalJobs.length < 10}
                                        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- ... existing code for other steps ... -->
                {:else if currentStep === 2}
                    <!-- Step 2: Set Week Start Date -->
                    <div class="space-y-6">
                        <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Select Week Start Date and Working Days
                        </h3>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div class="flex items-start space-x-3">
                                <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <p class="text-blue-800 font-medium">Selected Assignment</p>
                                    <p class="text-blue-700 text-sm mt-1">
                                        <strong>Candidate:</strong> {selectedCandidate?.firstName} {selectedCandidate?.lastName}<br>
                                        <strong>Job:</strong> {selectedJob?.jobTitle} at {selectedJob?.companyName}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <label class="block text-sm font-medium text-gray-700">
                                Week Start Date (Monday)
                            </label>
                            <input 
                                type="date" 
                                bind:value={weekStartDate}
                                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                required
                            />
                            
                     {#if weekStartDate}
    <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium text-gray-800">Week Overview - Select Working Days</h4>
            <div class="flex space-x-2">
                <button 
                    on:click={() => {
                        daysOfWeek.forEach(day => selectedDays.add(day.key));
                        selectedDays = new Set(selectedDays);
                    }}
                    class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                    Select All
                </button>
                <button 
                    on:click={() => {
                        selectedDays.clear();
                        selectedDays = new Set(selectedDays);
                    }}
                    class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                    Clear All
                </button>
            </div>
        </div>
        <div class="grid grid-cols-7 gap-2 text-sm">
            {#each daysOfWeek as day, index}
                {@const workDate = calculateWorkDate(day.key)}
                {@const isSelected = selectedDays.has(day.key)}
                <button
                    on:click={() => toggleDaySelection(day.key)}
                    class="text-center p-3 rounded border transition-all duration-200 hover:shadow-md {
                        isSelected 
                            ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }"
                >
                    <div class="font-medium">{day.label.slice(0, 3)}</div>
                    <div class="text-xs mt-1 opacity-75">
                        {workDate ? new Date(workDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </div>
                    {#if isSelected}
                        <div class="mt-1">
                            <svg class="w-4 h-4 mx-auto text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
        {#if selectedDays.size > 0}
            <div class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <strong>{selectedDays.size}</strong> day{selectedDays.size !== 1 ? 's' : ''} selected for timesheet creation
            </div>
        {/if}
    </div>
{/if}
                        </div>
                    </div>
                    
                {:else if currentStep === 3}
                    <!-- Step 3: Configure Daily Timesheets (Only Selected Days) -->
                    <div class="space-y-6">
                        <!-- Candidate Charges Section -->
                        {#if selectedCandidateDetails?.paymentModel}
                            <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                        </svg>
                                        <h4 class="text-lg font-semibold text-gray-800">Candidate Charges</h4>
                                    </div>
                                    <div class="flex space-x-2">
                                        {#if !isEditingCharges}
                                            <button 
                                                on:click={startEditingCharges}
                                                class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                                            >
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                        {:else}
                                            <button 
                                                on:click={cancelEditingCharges}
                                                class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                disabled={savingCharges}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                on:click={saveCandidateCharges}
                                                class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center"
                                                disabled={savingCharges}
                                            >
                                                {#if savingCharges}
                                                    <svg class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                        <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                {:else}
                                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                    </svg>
                                                    Save
                                                {/if}
                                            </button>
                                        {/if}
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <!-- Base Payment -->
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm text-gray-600">Base Payment</p>
                                            {#if isEditingCharges}
                                                <div class="flex items-center">
                                                    <span class="text-lg font-bold text-gray-800 mr-1">£</span>
                                                    <input 
                                                        type="number" 
                                                        bind:value={editedPayment}
                                                        min="0" 
                                                        step="0.01"
                                                        class="text-lg font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-20"
                                                    />
                                                    <span class="text-lg font-bold text-gray-800 ml-1">/hr</span>
                                                </div>
                                            {:else}
                                                <p class="text-lg font-bold text-gray-800">£{selectedCandidateDetails.paymentModel.payment}/hr</p>
                                            {/if}
                                        </div>
                                    </div>
                                    
                                    <!-- Temporary Charge -->
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm text-gray-600">Temporary Charge</p>
                                            {#if isEditingCharges}
                                                <div class="flex items-center">
                                                    <span class="text-lg font-bold text-gray-800 mr-1">£</span>
                                                    <input 
                                                        type="number" 
                                                        bind:value={editedTemporaryCharge}
                                                        min="0" 
                                                        step="0.01"
                                                        class="text-lg font-bold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 w-20"
                                                    />
                                                    <span class="text-lg font-bold text-gray-800 ml-1">/hr</span>
                                                </div>
                                            {:else}
                                                <p class="text-lg font-bold text-gray-800">£{selectedCandidateDetails.paymentModel.temporaryCharge}/hr</p>
                                            {/if}
                                        </div>
                                    </div>
                                    
                                    <!-- Status -->
                                    {#if selectedCandidateDetails.paymentModel.temporaryChargeActive !== undefined}
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 {(isEditingCharges ? editedTemporaryChargeActive : selectedCandidateDetails.paymentModel.temporaryChargeActive) ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center">
                                                <svg class="w-5 h-5 {(isEditingCharges ? editedTemporaryChargeActive : selectedCandidateDetails.paymentModel.temporaryChargeActive) ? 'text-green-600' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{(isEditingCharges ? editedTemporaryChargeActive : selectedCandidateDetails.paymentModel.temporaryChargeActive) ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'}"></path>
                                                </svg>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-sm text-gray-600">Status</p>
                                                {#if isEditingCharges}
                                                    <label class="flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            bind:checked={editedTemporaryChargeActive}
                                                            class="sr-only"
                                                        />
                                                        <div class="relative">
                                                            <div class="w-10 h-6 bg-gray-200 rounded-full shadow-inner transition-colors {editedTemporaryChargeActive ? 'bg-green-400' : ''}"></div>
                                                            <div class="absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform {editedTemporaryChargeActive ? 'translate-x-5' : 'translate-x-1'}"></div>
                                                        </div>
                                                        <span class="ml-2 text-sm font-medium {editedTemporaryChargeActive ? 'text-green-800' : 'text-red-800'}">
                                                            {editedTemporaryChargeActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </label>
                                                {:else}
                                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium {selectedCandidateDetails.paymentModel.temporaryChargeActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                        {selectedCandidateDetails.paymentModel.temporaryChargeActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                {/if}
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/if}
                        
                        <div class="flex justify-between items-center">
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Configure Daily Timesheets
                                <span class="ml-2 text-sm text-gray-500">({selectedDays.size} selected days)</span>
                            </h3>
                            
                            <!-- Quick Setup Options -->
                            <div class="flex space-x-2">
                                <button 
                                    on:click={() => applyToSelectedDays('start', '09:00')}
                                    class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                    9 AM Start
                                </button>
                                <button 
                                    on:click={() => applyToSelectedDays('finish', '17:00')}
                                    class="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                                >
                                    5 PM Finish
                                </button>
                                <button 
                                    on:click={() => applyToSelectedDays('break', '01:00')}
                                    class="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                                >
                                    1 Hour Break
                                </button>
                            </div>
                        </div>
                        
                        <div class="space-y-4 max-h-96 overflow-y-auto">
                            {#each daysOfWeek as day}
                                {#if selectedDays.has(day.key)}
                                    {@const dayData = (timesheetData as any)[day.key]}
                                    {@const workDate = calculateWorkDate(day.key)}
                                    <div class="border border-gray-200 rounded-lg p-4 bg-white">
                                        <div class="flex items-center justify-between mb-4">
                                            <h4 class="font-semibold text-gray-800 flex items-center">
                                                <span class="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                                {day.label}
                                            </h4>
                                            <span class="text-sm text-gray-500">
                                                {workDate ? new Date(workDate).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        
                                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                                                <input 
                                                    type="time" 
                                                    bind:value={dayData.start}
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Finish Time</label>
                                                <input 
                                                    type="time" 
                                                    bind:value={dayData.finish}
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Break Duration</label>
                                                <input 
                                                    type="time" 
                                                    bind:value={dayData.break}
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                                <select 
                                                    bind:value={dayData.rating}
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                >
                                                    <option value={1}>1 - Poor</option>
                                                    <option value={2}>2 - Fair</option>
                                                    <option value={3}>3 - Good</option>
                                                    <option value={4}>4 - Very Good</option>
                                                    <option value={5}>5 - Excellent</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Expenses (£)</label>
                                                <input 
                                                    type="number" 
                                                    bind:value={dayData.expense}
                                                    min="0" 
                                                    step="0.01"
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Miles</label>
                                                <input 
                                                    type="number" 
                                                    bind:value={dayData.miles}
                                                    min="0" 
                                                    step="0.1"
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                                />
                                            </div>
                                            
                                            <div class="md:col-span-2">
                                                <label class="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                                <textarea 
                                                    bind:value={dayData.notes}
                                                    rows="2"
                                                    class="w-full p-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                                    placeholder="Optional notes for this day..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    </div>
                {/if}
                
                <!-- Navigation Buttons -->
                <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <button 
                        on:click={prevStep}
                        disabled={currentStep === 1}
                        class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Previous
                    </button>
                    
                    <div class="flex space-x-3">
                        {#if currentStep < totalSteps}
                            <button 
                                on:click={nextStep}
                                disabled={currentStep === 1 && (!selectedCandidate || !selectedJob)}
                                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Next Step
                            </button>
                        {:else}
                            <button 
                                on:click={handleSubmit}
                                disabled={submitting || !selectedCandidate || !selectedJob || !weekStartDate}
                                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                            >
                                {#if submitting}
                                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {/if}
                                Create Timesheet
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Toast Component -->
<Toast bind:show={showToast} message={toastMessage} type={toastType} />

<!-- Add validation errors display -->
{#if validationErrors.length > 0}
    <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 class="text-red-800 font-medium mb-2">Requirements Not Met:</h4>
        <ul class="text-red-700 text-sm space-y-1">
            {#each validationErrors as error}
                <li>• {error}</li>
            {/each}
        </ul>
        <p class="text-red-600 text-xs mt-2">
            Please ensure the candidate has verified bank details and a configured payment model before creating timesheets.
        </p>
    </div>
{/if}