<script lang="ts">
    import { fly } from 'svelte/transition';
    import CircularProgress from './CircularProgress.svelte';
    import InputField from '../general_components/InputField.svelte';
    import Toast from '../general_components/Toast.svelte';
    import type { AppliedCandidate, ClientsType, SelectedClientType, ClientStatisticsResponse, ClientChargesData, ClientCustomFieldsData, ClientContact } from '$lib/services/client_services/client.type';
    import AddNewClient from '../all_clients/AddNewClient.svelte';
    import { jobs, jobActions } from '$lib/services/job_services/job.store';
    import { clientActions, clientStatistics, statisticsLoading, clientCharges, clientCustomFields, chargesLoading, customFieldsLoading, clientContacts, contactsLoading, contactsError } from '$lib/services/client_services/client.store';
    import { API_CONFIG } from '$lib/services/api';
    
    let isUpdatingStatus = $state(false);
    let showEditModal = $state(false);
    let activeTab = $state('details');
    let isSavingCharges = $state(false);
    let isSavingCustomFields = $state(false);
    
    // Contact modal state
    let showContactModal = $state(false);
    let editingContact: ClientContact | null = $state(null);
    let isSavingContact = $state(false);
    let isVerifying = $state(false);
    
    // Toast state
    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType: 'success' | 'error' = $state('success');
    
    const {client} = $props<{client:SelectedClientType}>();
    
    // Form states
    let chargesForm = $state({
        currentCharges: 0,
        temporaryCharges: 0,
        temporaryChargesIsActive: true
    });
    
    let customFieldsForm = $state({
        dateTcField: '',
        unqualifiedPartExperienced: 0,
        unqualifiedExperience: 0,
        childrenLevelTwo: 0,
        childrenLevelThree: 0,
        childrenLevelFourAndUp: 0,
        nurseryChef: 0,
        findersFeeStandard: 0,
        findersFeePermOneToFourWeeks: 0,
        findersFeePermFiveToEightWeeks: 0,
        findersFeePermEightToTwelveWeeks: 0,
        teachingAssistant: 0,
        senTeachingAssistant: 0,
        supplyTeacher: 0,
        qualifiedNurseryStaff: 0,
        longTermTeacher: 0,
        longTermStaff: 0,
        longTermTA: 0,
        longTermSenTA: 0
    });
    
    // Contact form state - updated to match API structure
    let contactForm = $state({
        division: '',
        forename: '',
        surname: '',
        jobTitle: '',
        priority: '',
        workTel: '',
        mobileTel: '',
        email: ''
    });
    
    async function loadJobs() {
        try {
            await jobActions.getAllJobs(client.id);
        } catch (error) {
            console.error('Failed to load jobs:', error);
        }
    }

    async function loadStatistics() {
        try {
            await clientActions.getClientStatistics(client.id);
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    }
    
    async function loadCharges() {
        try {
            await clientActions.getClientCharges(client.id);
        } catch (error) {
            console.error('Failed to load charges:', error);
        }
    }
    
    async function loadCustomFields() {
        try {
            await clientActions.getClientCustomFields(client.id);
        } catch (error) {
            console.error('Failed to load custom fields:', error);
        }
    }
    
    async function loadContacts() {
        try {
            await clientActions.getClientContacts(client.id);
        } catch (error) {
            console.error('Failed to load contacts:', error);
        }
    }

    $effect(() => {
        loadJobs();
        loadStatistics();
        loadCharges();
        loadCustomFields();
        loadContacts();
    });
    
    // Update form when data loads
    $effect(() => {
        if ($clientCharges?.data) {
            chargesForm = {
                currentCharges: $clientCharges.data.currentCharges,
                temporaryCharges: $clientCharges.data.temporaryCharges,
                temporaryChargesIsActive: $clientCharges.data.temporaryChargesIsActive
            };
        }
    });
    
    $effect(() => {
        if ($clientCustomFields?.data) {
            customFieldsForm = {
                dateTcField: $clientCustomFields.data.dateTcField,
                unqualifiedPartExperienced: $clientCustomFields.data.unqualifiedPartExperienced,
                unqualifiedExperience: $clientCustomFields.data.unqualifiedExperience,
                childrenLevelTwo: $clientCustomFields.data.childrenLevelTwo,
                childrenLevelThree: $clientCustomFields.data.childrenLevelThree,
                childrenLevelFourAndUp: $clientCustomFields.data.childrenLevelFourAndUp,
                nurseryChef: $clientCustomFields.data.nurseryChef,
                findersFeeStandard: $clientCustomFields.data.findersFeeStandard,
                findersFeePermOneToFourWeeks: $clientCustomFields.data.findersFeePermOneToFourWeeks,
                findersFeePermFiveToEightWeeks: $clientCustomFields.data.findersFeePermFiveToEightWeeks,
                findersFeePermEightToTwelveWeeks: $clientCustomFields.data.findersFeePermEightToTwelveWeeks,
                teachingAssistant: $clientCustomFields.data.teachingAssistant,
                senTeachingAssistant: $clientCustomFields.data.senTeachingAssistant,
                supplyTeacher: $clientCustomFields.data.supplyTeacher,
                qualifiedNurseryStaff: $clientCustomFields.data.qualifiedNurseryStaff,
                longTermTeacher: $clientCustomFields.data.longTermTeacher,
                longTermStaff: $clientCustomFields.data.longTermStaff,
                longTermTA: $clientCustomFields.data.longTermTA,
                longTermSenTA: $clientCustomFields.data.longTermSenTA
            };
        }
    });
    
    let client_detail: ClientsType = $derived(client);
    let appliedCandidate: AppliedCandidate[] = $derived(client?.applied_candidates);

    const getStatusColor = (status: number) => {
        return status === 1
            ? 'bg-[#86e49d] text-[#006b21]' 
            : 'bg-[#d893a3] text-[#b30021]';
    };

    let statistics = $derived([
        { 
            label: 'Total Jobs', 
            value: $clientStatistics?.data?.totalJobs || 0, 
            percentage: Math.min(($clientStatistics?.data?.totalJobs || 0) * 10, 100), 
            color: '#6366f1' 
        },
        { 
            label: 'Active Jobs', 
            value: $clientStatistics?.data?.activeJobs || 0, 
            percentage: Math.min((($clientStatistics?.data?.activeJobs || 0) * 100) / (($clientStatistics?.data?.totalJobs || 1)), 100),
            color: '#22c55e' 
        },
        { 
            label: 'Jobs Completed', 
            value: $clientStatistics?.data?.totalJobCompleted || 0, 
            percentage: Math.min((($clientStatistics?.data?.totalJobCompleted || 0) * 100) / (($clientStatistics?.data?.totalJobs || 1)), 100),
            color: '#3b82f6' 
        },
    ]);
    
    async function saveCharges() {
        isSavingCharges = true;
        try {
            const result = await clientActions.updateClientCharges(client.id, chargesForm);
            if (result.success) {
                toastType = 'success';
                toastMessage = 'Charges updated successfully';
                showToast = true;
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to update charges';
                showToast = true;
            }
        } catch (error) {
            console.error('Error saving charges:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while updating charges';
            showToast = true;
        } finally {
            isSavingCharges = false;
        }
    }
    
    async function saveCustomFields() {
        isSavingCustomFields = true;
        try {
            const result = await clientActions.updateClientCustomFields(client.id, customFieldsForm);
            if (result.success) {
                toastType = 'success';
                toastMessage = 'Custom fields updated successfully';
                showToast = true;
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to update custom fields';
                showToast = true;
            }
        } catch (error) {
            console.error('Error saving custom fields:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while updating custom fields';
            showToast = true;
        } finally {
            isSavingCustomFields = false;
        }
    }
    
    function resetContactForm() {
        contactForm = {
            division: '',
            forename: '',
            surname: '',
            jobTitle: '',
            priority: '',
            workTel: '',
            mobileTel: '',
            email: ''
        };
        editingContact = null;
    }
    
    function openContactModal(contact?: ClientContact) {
        if (contact) {
            editingContact = contact;
            contactForm = {
                division: contact.division,
                forename: contact.forename,
                surname: contact.surname,
                jobTitle: contact.jobTitle,
                priority: contact.priority,
                workTel: contact.workTel,
                mobileTel: contact.mobileTel,
                email: contact.email
            };
        } else {
            resetContactForm();
        }
        showContactModal = true;
    }
    
    async function saveContact() {
        isSavingContact = true;
        try {
            let result;
            if (editingContact) {
                result = await clientActions.updateClientContact(client.id, editingContact.id, contactForm);
            } else {
                result = await clientActions.createClientContact(client.id, contactForm);
            }
            
            if (result.success) {
                toastType = 'success';
                toastMessage = editingContact ? 'Contact updated successfully' : 'Contact created successfully';
                showToast = true;
                showContactModal = false;
                resetContactForm();
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to save contact';
                showToast = true;
            }
        } catch (error) {
            console.error('Error saving contact:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while saving contact';
            showToast = true;
        } finally {
            isSavingContact = false;
        }
    }
    
    async function deleteContact(contactId: string) {
        if (confirm('Are you sure you want to delete this contact?')) {
            try {
                const result = await clientActions.deleteClientContact(client.id, contactId);
                if (result.success) {
                    toastType = 'success';
                    toastMessage = 'Contact deleted successfully';
                    showToast = true;
                } else {
                    toastType = 'error';
                    toastMessage = result.message || 'Failed to delete contact';
                    showToast = true;
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                toastType = 'error';
                toastMessage = 'An error occurred while deleting contact';
                showToast = true;
            }
        }
    }

    function formatDate(dateString: string){
        return new Date(dateString).toLocaleDateString('en-US',{
            year:'numeric',
            month:'long',
            day:'numeric'
        })
    }
    
    function closeContactModal() {
        showContactModal = false;
        resetContactForm();
    }
    
    async function verifyClient() {
        isVerifying = true;
        try {
            const result = await clientActions.verifyClient(client.id, true);
            if (result.success) {
                toastType = 'success';
                toastMessage = 'Client verified successfully';
                showToast = true;
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to verify client';
                showToast = true;
            }
        } catch (error) {
            console.error('Error verifying client:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while verifying the client';
            showToast = true;
        } finally {
            isVerifying = false;
        }
    }
</script>

<AddNewClient
    showModal={showEditModal}
    existingClient={client_detail}
    on:close={() => showEditModal = false}
    on:clientAdded={() => showEditModal = false}
/>

<div 
    class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] p-8"
    in:fly={{ x: 100, duration: 800, delay: 300 }}
>
    <!-- Header -->
    <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            <img 
                src={API_CONFIG.IMAGE_URL + client_detail?.profilePictureUrl} 
                alt={client?.profilePictureUrl}
                class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
            />
        </div>
        <div>
            <div class="flex items-center gap-2">
                <h3 class="text-3xl font-bold text-gray-800 mt-2">{client_detail?.companyName}</h3>
                <button class="text-gray-500 hover:text-gray-700"
                    onclick={() => showEditModal = true}>
                    <span class="material-icons-sharp text-2xl">edit</span>
                </button>
            </div>
        </div>
        <div class="ml-auto flex items-center gap-3">
            <span class="px-4 py-2 rounded-full {getStatusColor(client_detail?.adminVerification === true ? 1 : 0)} font-medium">
                {client_detail?.adminVerification === true ? 'Verified' : 'Unverified'}
            </span>
            {#if !client_detail?.adminVerification}
                <button
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    onclick={verifyClient}
                    disabled={isVerifying}
                >
                    {#if isVerifying}
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Verifying...
                    {:else}
                        <span class="material-icons-sharp text-sm">verified</span>
                        Verify Client
                    {/if}
                </button>
            {/if}
        </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                <button
                    class="{activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'details'}
                >
                    Company Details
                </button>
                <button
                    class="{activeTab === 'charges' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'charges'}
                >
                    Client Charges
                </button>
                <button
                    class="{activeTab === 'custom-fields' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'custom-fields'}
                >
                    Custom Fields
                </button>
                <button
                    class="{activeTab === 'contacts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                    onclick={() => activeTab = 'contacts'}
                >
                    Contacts
                </button>
            </nav>
        </div>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'details'}
        <div class="grid grid-cols-2 gap-8" in:fly={{ x: 100, duration: 300 }}>
            <!-- Company Information -->
            <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">Company Information</h4>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">business</span>
                        <div>
                            <p class="text-sm text-gray-500">Company Name</p>
                            <p class="text-gray-800 font-medium">{client_detail?.companyName}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">calendar_today</span>
                        <div>
                            <p class="text-sm text-gray-500">Date Joined</p>
                            <p class="text-gray-800 font-medium">{formatDate(client_detail?.createdAt)}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">groups</span>
                        <div>
                            <p class="text-sm text-gray-500">Active Candidates</p>
                            <p class="text-gray-800 font-medium">{client_detail?.totalJobsPosted}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">Contact Information</h4>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">location_on</span>
                        <div>
                            <p class="text-sm text-gray-500">Location</p>
                            <p class="text-gray-800 font-medium">{client_detail?.address}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">verified</span>
                        <div class="flex-1">
                            <p class="text-sm text-gray-500">Verification Status</p>
                            <div class="flex items-center gap-3">
                                <p class="text-gray-800 font-medium capitalize">{client_detail?.adminVerification === true ? 'Verified' : 'Unverified'}</p>
                                {#if !client_detail?.adminVerification}
                                    <button
                                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                        onclick={verifyClient}
                                        disabled={isVerifying}
                                    >
                                        {#if isVerifying}
                                            <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            Verifying...
                                        {:else}
                                            <span class="material-icons-sharp text-xs">verified</span>
                                            Verify
                                        {/if}
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

            <!-- Statistics -->
            <div class="col-span-2 space-y-6 p-6 bg-gray-50 rounded-xl">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">Company Statistics</h4>
                {#if $statisticsLoading}
                    <div class="flex justify-center items-center h-32">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-2 text-gray-600">Loading statistics...</span>
                    </div>
                {:else}
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
                {/if}
            </div>
        </div>
    {/if}

    {#if activeTab === 'charges'}
        <div class="space-y-6" in:fly={{ x: 100, duration: 300 }}>
            <div class="p-6 bg-gray-50 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="text-xl font-semibold text-gray-800">Client Charges</h4>
                    <button
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onclick={saveCharges}
                        disabled={isSavingCharges || $chargesLoading}
                    >
                        {isSavingCharges ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                
                {#if $chargesLoading}
                    <div class="flex justify-center items-center h-32">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-2 text-gray-600">Loading charges...</span>
                    </div>
                {:else}
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Current Charges</label>
                            <input
                                type="number"
                                bind:value={chargesForm.currentCharges}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Temporary Charges</label>
                            <input
                                type="number"
                                bind:value={chargesForm.temporaryCharges}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div class="col-span-2">
                            <label class="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    bind:checked={chargesForm.temporaryChargesIsActive}
                                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span class="text-sm font-medium text-gray-700">Temporary Charges Active</span>
                            </label>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    {#if activeTab === 'custom-fields'}
        <div class="space-y-6" in:fly={{ x: 100, duration: 300 }}>
            <div class="p-6 bg-gray-50 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="text-xl font-semibold text-gray-800">Custom Fields</h4>
                    <button
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onclick={saveCustomFields}
                        disabled={isSavingCustomFields || $customFieldsLoading}
                    >
                        {isSavingCustomFields ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                
                {#if $customFieldsLoading}
                    <div class="flex justify-center items-center h-32">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-2 text-gray-600">Loading custom fields...</span>
                    </div>
                {:else}
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Date TC Field</label>
                            <input
                                type="text"
                                bind:value={customFieldsForm.dateTcField}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Unqualified Part Experienced</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.unqualifiedPartExperienced}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Unqualified Experience</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.unqualifiedExperience}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Children Level Two</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.childrenLevelTwo}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Children Level Three</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.childrenLevelThree}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Children Level Four And Up</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.childrenLevelFourAndUp}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nursery Chef</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.nurseryChef}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Finders Fee Standard</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.findersFeeStandard}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Finders Fee Perm 1-4 Weeks</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.findersFeePermOneToFourWeeks}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Finders Fee Perm 5-8 Weeks</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.findersFeePermFiveToEightWeeks}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Finders Fee Perm 8-12 Weeks</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.findersFeePermEightToTwelveWeeks}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teaching Assistant</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.teachingAssistant}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SEN Teaching Assistant</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.senTeachingAssistant}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Supply Teacher</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.supplyTeacher}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Qualified Nursery Staff</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.qualifiedNurseryStaff}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Long Term Teacher</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.longTermTeacher}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Long Term Staff</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.longTermStaff}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Long Term TA</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.longTermTA}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Long Term SEN TA</label>
                            <input
                                type="number"
                                bind:value={customFieldsForm.longTermSenTA}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                step="0.01"
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
    {#if activeTab === 'contacts'}
        <div class="space-y-6" in:fly={{ x: 100, duration: 300 }}>
            <div class="p-6 bg-gray-50 rounded-xl">
                <div class="flex justify-between items-center mb-6">
                    <h4 class="text-xl font-semibold text-gray-800">Client Contacts</h4>
                    <button
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onclick={() => openContactModal()}
                    >
                        Add Contact
                    </button>
                </div>
                
                {#if $contactsLoading}
                    <div class="flex justify-center items-center h-32">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span class="ml-2 text-gray-600">Loading contacts...</span>
                    </div>
                {:else if $contactsError}
                    <div class="text-center py-8">
                        <p class="text-red-600">Error loading contacts: {$contactsError}</p>
                    </div>
                {:else if $clientContacts?.data?.contacts?.length === 0}
                    <div class="text-center py-8">
                        <p class="text-gray-500">No contacts found for this client.</p>
                    </div>
                {:else}
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Phone</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                {#each ($clientContacts?.data?.contacts || []) as contact}
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {contact.forename} {contact.surname}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.jobTitle}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.division}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.email}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.workTel}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                class="text-blue-600 hover:text-blue-900 mr-3"
                                                onclick={() => openContactModal(contact)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                class="text-red-600 hover:text-red-900"
                                                onclick={() => deleteContact(contact.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        </div>
    {/if}

    {#if showContactModal}
    <div class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">
                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <button
                    class="text-gray-400 hover:text-gray-600"
                    onclick={closeContactModal}
                >
                    <span class="material-icons-sharp">close</span>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <InputField
                        label="First Name"
                        bind:value={contactForm.forename}
                        placeholder="Enter first name"
                        required
                    />
                    <InputField
                        label="Last Name"
                        bind:value={contactForm.surname}
                        placeholder="Enter last name"
                        required
                    />
                </div>
                
                <InputField
                    label="Email"
                    type="email"
                    bind:value={contactForm.email}
                    placeholder="Enter email address"
                    required
                />
                
                <InputField
                    label="Job Title"
                    bind:value={contactForm.jobTitle}
                    placeholder="Enter job title"
                    required
                />
                
                <InputField
                    label="Division"
                    bind:value={contactForm.division}
                    placeholder="Enter division"
                    required
                />
                
                <div class="grid grid-cols-2 gap-4">
                    <InputField
                        label="Work Phone"
                        bind:value={contactForm.workTel}
                        placeholder="Enter work phone"
                    />
                    <InputField
                        label="Mobile Phone"
                        bind:value={contactForm.mobileTel}
                        placeholder="Enter mobile phone"
                    />
                </div>
                
                <InputField
                    label="Priority"
                    bind:value={contactForm.priority}
                    placeholder="Enter priority level"
                />
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button
                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onclick={resetContactForm}
                >
                    Cancel
                </button>
                <button
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    onclick={saveContact}
                    disabled={isSavingContact}
                >
                    {isSavingContact ? 'Saving...' : (editingContact ? 'Update' : 'Create')}
                </button>
            </div>
        </div>
    </div>
{/if}
</div>

<!-- Add Toast component at the end of the template -->
<Toast 
    bind:show={showToast}
    message={toastMessage}
    type={toastType}
/>
