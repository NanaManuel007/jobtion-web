<script lang="ts">
    import { fly } from 'svelte/transition';
    import type { DetailedCandidate, BankDetails, PaymentModel } from '$lib/services/candidate_services/candidate.types';
    import { API_CONFIG } from '$lib/services/api';
    import Toast from '../../general_components/Toast.svelte';
    import InputField from '../../general_components/InputField.svelte';
    import { candidateStore } from '$lib/services/candidate_services/candidate.store';
    import { CandidateService } from '$lib/services/candidate_services/candidate.services';

    export let candidate: DetailedCandidate;
    
    let activeTab = 'general';
    let showToast = false;
    let toastMessage = '';
    let toastType: 'success' | 'error' = 'success';
    let isUpdatingVerification = false;
    
    // Image modal state
    let showImageModal = false;
    let modalImageUrl = '';
    let modalImageTitle = '';

    // Bank/Payment modal state
    let showBankPaymentModal = false;
    let modalType: 'bank' | 'payment' = 'bank';
    let isEditing = false;
    let isSubmitting = false;
    
    // Form data
    let bankFormData: Partial<BankDetails> = {
        bankName: '',
        accountNumber: '',
        sortCode: '',
        accountHolderName: '',
        swiftCode: '',
        iban: ''
    };
    
    let paymentFormData: Partial<PaymentModel> = {
        temporaryCharge: 0,
        temporaryChargeActive: false,
        qualification: '',
        payment: 0
    };

    const tabs = [
        { id: 'general', label: 'General Details', icon: 'person' },
        { id: 'profile', label: 'Profile Information', icon: 'account_circle' },
        { id: 'bank', label: 'Bank Details', icon: 'account_balance' },
        { id: 'statistics', label: 'Statistics', icon: 'analytics' }
    ];

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function getStatusColor(status: boolean) {
        return status
            ? 'bg-[#86e49d] text-[#006b21]' 
            : 'bg-[#d893a3] text-[#b30021]';
    }

    function openImageModal(imageUrl: string, title: string) {
        modalImageUrl = API_CONFIG.IMAGE_URL + imageUrl;
        modalImageTitle = title;
        showImageModal = true;
    }

    function closeImageModal() {
        showImageModal = false;
        modalImageUrl = '';
        modalImageTitle = '';
    }

    function openPdfDocument(pdfUrl: string, title: string) {
        const fullUrl = API_CONFIG.IMAGE_URL + pdfUrl;
        window.open(fullUrl, '_blank');
    }

    function isValidUrl(url: string | null | undefined): boolean {
        return url !== null && url !== undefined && url.trim() !== '';
    }

    async function toggleAdminVerification() {
        isUpdatingVerification = true;
        try {
            const result = await candidateStore.verifyCandidate(candidate.id, !candidate.isAdminVerified);
            if (result.success) {
                candidate.isAdminVerified = !candidate.isAdminVerified;
                toastType = 'success';
                toastMessage = `Candidate ${candidate.isAdminVerified ? 'verified' : 'unverified'} successfully`;
                showToast = true;
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to update verification status';
                showToast = true;
            }
        } catch (error) {
            console.error('Error updating verification:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while updating verification status';
            showToast = true;
        } finally {
            isUpdatingVerification = false;
        }
    }

    function openBankModal() {
        modalType = 'bank';
        isEditing = !!candidate.bankDetails;
        
        if (isEditing && candidate.bankDetails) {
            bankFormData = {
                bankName: candidate.bankDetails.bankName,
                accountNumber: candidate.bankDetails.accountNumber,
                sortCode: candidate.bankDetails.sortCode,
                accountHolderName: candidate.bankDetails.accountHolderName,
                swiftCode: candidate.bankDetails.swiftCode || '',
                iban: candidate.bankDetails.iban || ''
            };
        } else {
            bankFormData = {
                bankName: '',
                accountNumber: '',
                sortCode: '',
                accountHolderName: '',
                swiftCode: '',
                iban: ''
            };
        }
        
        showBankPaymentModal = true;
    }

    function openPaymentModal() {
        modalType = 'payment';
        isEditing = !!candidate.paymentModel;
        
        if (isEditing && candidate.paymentModel) {
            paymentFormData = {
                temporaryCharge: candidate.paymentModel.temporaryCharge,
                temporaryChargeActive: candidate.paymentModel.temporaryChargeActive,
                qualification: candidate.paymentModel.qualification,
                payment: candidate.paymentModel.payment
            };
        } else {
            paymentFormData = {
                temporaryCharge: 0,
                temporaryChargeActive: false,
                qualification: '',
                payment: 0
            };
        }
        
        showBankPaymentModal = true;
    }

    function closeBankPaymentModal() {
        showBankPaymentModal = false;
        isSubmitting = false;
    }

    async function handleSubmit() {
        isSubmitting = true;
        
        try {
            let result;
            
            if (modalType === 'bank') {
                if (isEditing) {
                    result = await CandidateService.updateBankDetails(candidate.id, bankFormData);
                } else {
                    result = await CandidateService.createBankDetails(candidate.id, bankFormData);
                }
                
                if (result.success && result.data) {
                    candidate.bankDetails = result.data;
                }
            } else {
                if (isEditing) {
                    result = await CandidateService.updatePaymentModel(candidate.id, paymentFormData);
                } else {
                    result = await CandidateService.createPaymentModel(candidate.id, paymentFormData);
                }
                
                if (result.success && result.data) {
                    candidate.paymentModel = result.data;
                }
            }
            
            if (result.success) {
                toastType = 'success';
                toastMessage = result.message;
                showToast = true;
                closeBankPaymentModal();
                
                // Trigger reactivity
                candidate = candidate;
            } else {
                toastType = 'error';
                toastMessage = result.message;
                showToast = true;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while saving';
            showToast = true;
        } finally {
            isSubmitting = false;
        }
    }

    // Add new state for bank verification
    let isUpdatingBankVerification = false;

    async function toggleBankVerification() {
        if (!candidate.bankDetails) return;
        
        isUpdatingBankVerification = true;
        try {
            const result = await CandidateService.verifyBankDetails(
                candidate.id, 
                !candidate.bankDetails.isVerified
            );
            
            if (result.success && result.data) {
                candidate.bankDetails = result.data;
                toastType = 'success';
                toastMessage = result.message;
                showToast = true;
                
                // Trigger reactivity
                candidate = candidate;
            } else {
                toastType = 'error';
                toastMessage = result.message || 'Failed to update bank verification status';
                showToast = true;
            }
        } catch (error) {
            console.error('Error updating bank verification:', error);
            toastType = 'error';
            toastMessage = 'An error occurred while updating bank verification status';
            showToast = true;
        } finally {
            isUpdatingBankVerification = false;
        }
    }
</script>

<div 
    class="bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] rounded-[15px] p-8"
    in:fly={{ x: 100, duration: 800, delay: 300 }}
>
    <!-- Header -->
    <div class="flex items-center gap-6 mb-8">
        <div class="w-24 h-24 rounded-full overflow-hidden shadow-lg">
            <img 
                src={candidate.profileOne?.profilePictureUrl ? API_CONFIG.IMAGE_URL + candidate.profileOne.profilePictureUrl : '/images/default.png'}
                alt="{candidate.firstName} {candidate.lastName}"
                class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
            />
        </div>
        <div>
            <h3 class="text-3xl font-bold text-gray-800 mt-2">{candidate.firstName} {candidate.lastName}</h3>
            <p class="text-gray-600">{candidate.email}</p>
        </div>
        <div class="ml-auto flex gap-3">
            <span class="px-4 py-2 rounded-full {getStatusColor(candidate.isEmailVerified)} font-medium">
                Email {candidate.isEmailVerified ? 'Verified' : 'Unverified'}
            </span>
            <button
                class="px-4 py-2 rounded-full {getStatusColor(candidate.isAdminVerified)} font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                on:click={toggleAdminVerification}
                disabled={isUpdatingVerification}
            >
                {isUpdatingVerification ? 'Updating...' : (candidate.isAdminVerified ? 'Admin Verified' : 'Admin Unverified')}
            </button>
        </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
        <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
                {#each tabs as tab}
                    <button
                        class="{activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
                        on:click={() => activeTab = tab.id}
                    >
                        <div class="flex items-center gap-2">
                            <span class="material-icons-sharp text-sm">{tab.icon}</span>
                            {tab.label}
                        </div>
                    </button>
                {/each}
            </nav>
        </div>
    </div>

    <!-- Tab Content -->
    {#if activeTab === 'general'}
        <div class="grid grid-cols-2 gap-8" in:fly={{ x: 100, duration: 300 }}>
            <!-- Basic Information -->
            <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">Basic Information</h4>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">person</span>
                        <div>
                            <p class="text-sm text-gray-500">Full Name</p>
                            <p class="text-gray-800 font-medium">{candidate.firstName} {candidate.lastName}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">email</span>
                        <div>
                            <p class="text-sm text-gray-500">Email</p>
                            <p class="text-gray-800 font-medium">{candidate.email}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">badge</span>
                        <div>
                            <p class="text-sm text-gray-500">User Type</p>
                            <p class="text-gray-800 font-medium capitalize">{candidate.userType}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">calendar_today</span>
                        <div>
                            <p class="text-sm text-gray-500">Date Joined</p>
                            <p class="text-gray-800 font-medium">{formatDate(candidate.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status Information -->
            <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                <h4 class="text-xl font-semibold text-gray-800 mb-4">Status Information</h4>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">verified</span>
                        <div>
                            <p class="text-sm text-gray-500">Email Verification</p>
                            <p class="text-gray-800 font-medium">{candidate.isEmailVerified ? 'Verified' : 'Unverified'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">admin_panel_settings</span>
                        <div>
                            <p class="text-sm text-gray-500">Admin Verification</p>
                            <p class="text-gray-800 font-medium">{candidate.isAdminVerified ? 'Verified' : 'Unverified'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">toggle_on</span>
                        <div>
                            <p class="text-sm text-gray-500">Account Status</p>
                            <p class="text-gray-800 font-medium">{candidate.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="material-icons-sharp text-gray-600">block</span>
                        <div>
                            <p class="text-sm text-gray-500">Suspension Status</p>
                            <p class="text-gray-800 font-medium">{candidate.isSuspended ? 'Suspended' : 'Not Suspended'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    {#if activeTab === 'profile'}
        <div class="grid grid-cols-2 gap-8" in:fly={{ x: 100, duration: 300 }}>
            <!-- Profile One -->
            {#if candidate.profileOne}
                <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                    <h4 class="text-xl font-semibold text-gray-800 mb-4">Personal Profile</h4>
                    <div class="space-y-4">
                        <!-- Images Row -->
                        <div class="flex items-center gap-6">
                            <!-- Profile Picture -->
                            {#if candidate.profileOne.profilePictureUrl}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-sm text-gray-500">Profile Picture</p>
                                    <button 
                                        class="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                        on:click={() => openImageModal(candidate.profileOne.profilePictureUrl, 'Profile Picture')}
                                    >
                                        <img 
                                            src={API_CONFIG.IMAGE_URL + candidate.profileOne.profilePictureUrl}
                                            alt="Profile Picture"
                                            class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- Identification Document -->
                            {#if candidate.profileOne.identificationDocumentUrl}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-sm text-gray-500">ID Document</p>
                                    <button 
                                        class="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-gray-100 flex items-center justify-center"
                                        on:click={() => openImageModal(candidate.profileOne.identificationDocumentUrl, 'Identification Document')}
                                    >
                                        <img 
                                            src={API_CONFIG.IMAGE_URL + candidate.profileOne.identificationDocumentUrl}
                                            alt="Identification Document"
                                            class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- Proof of Address -->
                            {#if candidate.profileOne.proofOfAddressUrl}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-sm text-gray-500">Proof of Address</p>
                                    <button 
                                        class="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-gray-100 flex items-center justify-center"
                                        on:click={() => openImageModal(candidate.profileOne.proofOfAddressUrl, 'Proof of Address')}
                                    >
                                        <img 
                                            src={API_CONFIG.IMAGE_URL + candidate.profileOne.proofOfAddressUrl}
                                            alt="Proof of Address"
                                            class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                        />
                                    </button>
                                </div>
                            {/if}
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">work</span>
                            <div>
                                <p class="text-sm text-gray-500">Title</p>
                                <p class="text-gray-800 font-medium">{candidate.profileOne.title || 'Not specified'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">phone</span>
                            <div>
                                <p class="text-sm text-gray-500">Phone Number</p>
                                <p class="text-gray-800 font-medium">{candidate.profileOne.phoneNumber || 'Not provided'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">location_on</span>
                            <div>
                                <p class="text-sm text-gray-500">Address</p>
                                <p class="text-gray-800 font-medium">{candidate.profileOne.address || 'Not provided'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">cake</span>
                            <div>
                                <p class="text-sm text-gray-500">Date of Birth</p>
                                <p class="text-gray-800 font-medium">{candidate.profileOne.dateOfBirth || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Profile Two -->
            {#if candidate.profileTwo}
                <div class="space-y-6 p-6 bg-gray-50 rounded-xl">
                    <h4 class="text-xl font-semibold text-gray-800 mb-4">Professional Profile</h4>
                    <div class="space-y-4">
                        <!-- Document Previews Row -->
                        <div class="flex items-center gap-4 flex-wrap">
                            <!-- Qualification Document -->
                            {#if isValidUrl(candidate.profileTwo.qualificationDocumentUrl)}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-xs text-gray-500">Qualification Doc</p>
                                    <button 
                                        class="w-12 h-16 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-red-50 flex items-center justify-center"
                                        on:click={() => openPdfDocument(candidate.profileTwo.qualificationDocumentUrl, 'Qualification Document')}
                                    >
                                        <span class="material-icons-sharp text-red-600 text-sm">picture_as_pdf</span>
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- CV Document -->
                            {#if isValidUrl(candidate.profileTwo.cvDocumentUrl)}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-xs text-gray-500">CV Document</p>
                                    <button 
                                        class="w-12 h-16 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-red-50 flex items-center justify-center"
                                        on:click={() => openPdfDocument(candidate.profileTwo.cvDocumentUrl, 'CV Document')}
                                    >
                                        <span class="material-icons-sharp text-red-600 text-sm">picture_as_pdf</span>
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- Customized Qualification -->
                            {#if isValidUrl(candidate.profileTwo.customizedQualificationUrl)}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-xs text-gray-500">Custom Qualification</p>
                                    <button 
                                        class="w-12 h-16 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-red-50 flex items-center justify-center"
                                        on:click={() => openPdfDocument(candidate.profileTwo.customizedQualificationUrl, 'Customized Qualification')}
                                    >
                                        <span class="material-icons-sharp text-red-600 text-sm">picture_as_pdf</span>
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- DBS Certificate -->
                            {#if isValidUrl(candidate.profileTwo.dbsCertificateUrl)}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-xs text-gray-500">DBS Certificate</p>
                                    <button 
                                        class="w-12 h-16 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-red-50 flex items-center justify-center"
                                        on:click={() => openPdfDocument(candidate.profileTwo.dbsCertificateUrl, 'DBS Certificate')}
                                    >
                                        <span class="material-icons-sharp text-red-600 text-sm">picture_as_pdf</span>
                                    </button>
                                </div>
                            {/if}
                            
                            <!-- Right to Work Document -->
                            {#if isValidUrl(candidate.profileTwo.rightToWorkDocumentUrl)}
                                <div class="flex flex-col items-center gap-2">
                                    <p class="text-xs text-gray-500">Right to Work</p>
                                    <button 
                                        class="w-12 h-16 rounded border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer bg-red-50 flex items-center justify-center"
                                        on:click={() => openPdfDocument(candidate.profileTwo.rightToWorkDocumentUrl, 'Right to Work Document')}
                                    >
                                        <span class="material-icons-sharp text-red-600 text-sm">picture_as_pdf</span>
                                    </button>
                                </div>
                            {/if}
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">school</span>
                            <div>
                                <p class="text-sm text-gray-500">Qualification Level</p>
                                <p class="text-gray-800 font-medium">{candidate.profileTwo.qualificationLevel || 'Not specified'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">verified_user</span>
                            <div>
                                <p class="text-sm text-gray-500">DBS Status</p>
                                <p class="text-gray-800 font-medium">{candidate.profileTwo.dbsOnUpdatedServer ? 'On Updated Server' : 'Not on Updated Server'}</p>
                            </div>
                        </div>
                        {#if candidate.profileTwo.dbsSerialNumber}
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">confirmation_number</span>
                                <div>
                                    <p class="text-sm text-gray-500">DBS Serial Number</p>
                                    <p class="text-gray-800 font-medium">{candidate.profileTwo.dbsSerialNumber}</p>
                                </div>
                            </div>
                        {/if}
                        {#if candidate.profileTwo.dbsExpiryDate}
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">event</span>
                                <div>
                                    <p class="text-sm text-gray-500">DBS Expiry Date</p>
                                    <p class="text-gray-800 font-medium">{candidate.profileTwo.dbsExpiryDate}</p>
                                </div>
                            </div>
                        {/if}
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">work_outline</span>
                            <div>
                                <p class="text-sm text-gray-500">Right to Work</p>
                                <p class="text-gray-800 font-medium">{candidate.profileTwo.rightToWork ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="material-icons-sharp text-gray-600">flag</span>
                            <div>
                                <p class="text-sm text-gray-500">UK Citizen</p>
                                <p class="text-gray-800 font-medium">{candidate.profileTwo.ukCitizen ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    {/if}

    {#if activeTab === 'bank'}
        <div class="space-y-6" in:fly={{ x: 100, duration: 300 }}>
            <!-- Bank Details and Payment Model Section -->
            <div class="grid grid-cols-2 gap-8">
                <!-- Bank Details Section -->
                <div class="p-6 bg-gray-50 rounded-xl">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-xl font-semibold text-gray-800">Bank Details</h4>
                        <button 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            on:click={openBankModal}
                        >
                            <span class="material-icons-sharp text-sm">{candidate.bankDetails ? 'edit' : 'add'}</span>
                            {candidate.bankDetails ? 'Edit' : 'Add'}
                        </button>
                    </div>
                    
                    {#if candidate.bankDetails}
                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">account_balance</span>
                                <div>
                                    <p class="text-sm text-gray-500">Bank Name</p>
                                    <p class="text-gray-800 font-medium">{candidate.bankDetails.bankName}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">person</span>
                                <div>
                                    <p class="text-sm text-gray-500">Account Holder Name</p>
                                    <p class="text-gray-800 font-medium">{candidate.bankDetails.accountHolderName}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">credit_card</span>
                                <div>
                                    <p class="text-sm text-gray-500">Account Number</p>
                                    <p class="text-gray-800 font-medium">{candidate.bankDetails.accountNumber}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">sort</span>
                                <div>
                                    <p class="text-sm text-gray-500">Sort Code</p>
                                    <p class="text-gray-800 font-medium">{candidate.bankDetails.sortCode}</p>
                                </div>
                            </div>
                                  <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">verified</span>
                                <div class="flex-1">
                                    <p class="text-sm text-gray-500">Verification Status</p>
                                    <div class="flex items-center gap-3">
                                        <span class="px-3 py-1 rounded-full {getStatusColor(candidate.bankDetails.isVerified)} font-medium">
                                            {candidate.bankDetails.isVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                        <button
                                            class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                            on:click={toggleBankVerification}
                                            disabled={isUpdatingBankVerification}
                                        >
                                            {#if isUpdatingBankVerification}
                                                <span class="material-icons-sharp text-xs animate-spin">refresh</span>
                                                Updating...
                                            {:else}
                                                <span class="material-icons-sharp text-xs">toggle_on</span>
                                                Change Status
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center py-8">
                            <span class="material-icons-sharp text-gray-400 text-4xl mb-2">account_balance</span>
                            <p class="text-gray-500">No bank details available</p>
                            <p class="text-sm text-gray-400">Click 'Add' to create bank details</p>
                        </div>
                    {/if}
                </div>

                <!-- Payment Model Section -->
                <div class="p-6 bg-blue-50 rounded-xl">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-xl font-semibold text-gray-800">Payment Model</h4>
                        <button 
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            on:click={openPaymentModal}
                        >
                            <span class="material-icons-sharp text-sm">{candidate.paymentModel ? 'edit' : 'add'}</span>
                            {candidate.paymentModel ? 'Edit' : 'Add'}
                        </button>
                    </div>
                    
                    {#if candidate.paymentModel}
                        <div class="space-y-4">
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">school</span>
                                <div>
                                    <p class="text-sm text-gray-500">Qualification</p>
                                    <p class="text-gray-800 font-medium">{candidate.paymentModel.qualification || 'Not specified'}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">payments</span>
                                <div>
                                    <p class="text-sm text-gray-500">Base Payment</p>
                                    <p class="text-gray-800 font-medium">£{candidate.paymentModel.payment}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">trending_up</span>
                                <div>
                                    <p class="text-sm text-gray-500">Temporary Charge</p>
                                    <p class="text-gray-800 font-medium">£{candidate.paymentModel.temporaryCharge}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="material-icons-sharp text-gray-600">toggle_on</span>
                                <div>
                                    <p class="text-sm text-gray-500">Temporary Charge Status</p>
                                    <span class="px-3 py-1 rounded-full {getStatusColor(candidate.paymentModel.temporaryChargeActive)} font-medium">
                                        {candidate.paymentModel.temporaryChargeActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center py-8">
                            <span class="material-icons-sharp text-gray-400 text-4xl mb-2">payments</span>
                            <p class="text-gray-500">No payment model information available</p>
                            <p class="text-sm text-gray-400">Click 'Add' to create payment model</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}

    {#if activeTab === 'statistics'}
        <div class="space-y-6" in:fly={{ x: 100, duration: 300 }}>
            {#if candidate.statistics}
                <div class="p-6 bg-gray-50 rounded-xl">
                    <h4 class="text-xl font-semibold text-gray-800 mb-4">Candidate Statistics</h4>
                    <div class="grid grid-cols-3 gap-6">
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-blue-600">{candidate.statistics.totalJobApplications}</p>
                            <p class="text-sm text-gray-500">Total Applications</p>
                        </div>
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-green-600">{candidate.statistics.activeJobApplications}</p>
                            <p class="text-sm text-gray-500">Active Applications</p>
                        </div>
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-purple-600">{candidate.statistics.completedJobApplications}</p>
                            <p class="text-sm text-gray-500">Completed Applications</p>
                        </div>
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-orange-600">{candidate.statistics.totalInternalJobAssignments}</p>
                            <p class="text-sm text-gray-500">Internal Assignments</p>
                        </div>
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-red-600">{candidate.statistics.totalHoursWorked}</p>
                            <p class="text-sm text-gray-500">Hours Worked</p>
                        </div>
                        <div class="text-center p-4 bg-white rounded-lg">
                            <p class="text-2xl font-bold text-indigo-600">£{candidate.statistics.totalEarnings}</p>
                            <p class="text-sm text-gray-500">Total Earnings</p>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="p-6 bg-gray-50 rounded-xl text-center">
                    <p class="text-gray-500">No statistics available</p>
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Image Modal -->
{#if showImageModal}
    <div 
        class="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
        on:click={closeImageModal}
        on:keydown={(e) => e.key === 'Escape' && closeImageModal()}
    >
        <div class="relative max-w-4xl max-h-full">
            <button 
                class="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 bg-opacity-50 rounded-full p-2"
                on:click={closeImageModal}
            >
                <span class="material-icons-sharp">close</span>
            </button>
            <div class="bg-white rounded-lg overflow-hidden">
                <div class="p-4 border-b">
                    <h3 class="text-lg font-semibold text-gray-800">{modalImageTitle}</h3>
                </div>
                <div class="p-4">
                    <img 
                        src={modalImageUrl}
                        alt={modalImageTitle}
                        class="max-w-full max-h-[70vh] object-contain mx-auto"
                        on:click|stopPropagation
                    />
                </div>
            </div>
        </div>
    </div>
{/if}

<Toast 
    bind:show={showToast}
    message={toastMessage}
    type={toastType}
/>

<!-- Bank/Payment Modal -->
{#if showBankPaymentModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b">
                <h3 class="text-lg font-semibold text-gray-800">
                    {isEditing ? 'Edit' : 'Add'} {modalType === 'bank' ? 'Bank Details' : 'Payment Model'}
                </h3>
            </div>
            
            <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
                {#if modalType === 'bank'}
                    <InputField
                        label="Bank Name"
                        bind:value={bankFormData.bankName}
                        type="text"
                        placeholder="Enter bank name"
                        required
                        icon="account_balance"
                    />
                    
                    <InputField
                        label="Account Holder Name"
                        bind:value={bankFormData.accountHolderName}
                        type="text"
                        placeholder="Enter account holder name"
                        required
                        icon="person"
                    />
                    
                    <InputField
                        label="Account Number"
                        bind:value={bankFormData.accountNumber}
                        type="text"
                        placeholder="Enter account number"
                        required
                        icon="credit_card"
                    />
                    
                    <InputField
                        label="Sort Code"
                        bind:value={bankFormData.sortCode}
                        type="text"
                        placeholder="Enter sort code"
                        required
                        icon="sort"
                    />
                    
                    <InputField
                        label="SWIFT Code (Optional)"
                        bind:value={bankFormData.swiftCode}
                        type="text"
                        placeholder="Enter SWIFT code"
                        icon="code"
                    />
                    
                    <InputField
                        label="IBAN (Optional)"
                        bind:value={bankFormData.iban}
                        type="text"
                        placeholder="Enter IBAN"
                        icon="account_box"
                    />
                {:else}
                    <InputField
                        label="Qualification"
                        bind:value={paymentFormData.qualification}
                        type="text"
                        placeholder="Enter qualification"
                        required
                        icon="school"
                    />
                    
                    <InputField
                        label="Base Payment (£)"
                        bind:value={paymentFormData.payment}
                        type="number"
                        placeholder="Enter base payment"
                        required
                        icon="payments"
                        min="0"
                        step="0.01"
                    />
                    
                    <InputField
                        label="Temporary Charge (£)"
                        bind:value={paymentFormData.temporaryCharge}
                        type="number"
                        placeholder="Enter temporary charge"
                        required
                        icon="trending_up"
                        min="0"
                        step="0.01"
                    />
                    
                    <div class="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="temporaryChargeActive"
                            bind:checked={paymentFormData.temporaryChargeActive}
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label for="temporaryChargeActive" class="text-sm font-medium text-gray-700">
                            Temporary Charge Active
                        </label>
                    </div>
                {/if}
                
                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        on:click={closeBankPaymentModal}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

         
