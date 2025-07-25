<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import InputField from '../general_components/InputField.svelte';
    import GoogleMaps from '../general_components/GoogleMaps.svelte';
    import { validateClientForm, type ClientFormData } from '$lib/services/client_services/client.validation';
    import { ClientService } from '$lib/services/client_services/client.services';
    import { clientActions, isLoading } from '$lib/services/client_services/client.store';
    import type { ClientsType } from '$lib/services/client_services/client.type';
    import Toast from '../general_components/Toast.svelte';
	import { API_CONFIG } from '$lib/services/api';

    const dispatch = createEventDispatcher();
    const { showModal, existingClient = null } = $props<{
        showModal: boolean;
        existingClient?: ClientsType | null
    }>();

    let showToast = $state(false);
    let toastMessage = $state('');
    let toastType = $state<'success' | 'error'>('success');

    let formData = $state({
        companyName: existingClient?.companyName || '',
        ceoFirstName: existingClient?.ceoFirstName || '',
        ceoLastName: existingClient?.ceoLastName || '',
        jobTitle: existingClient?.companyJobTitle || '',
        companyEmail: existingClient?.email || '',
        password: '', // Add password field for new clients
        companyNumber: existingClient?.phoneNumber || '',
        companyAddress: existingClient?.address || '',
        postalCode: existingClient?.postcode || '',
        registrationNumber: existingClient?.companyHouseNumber || '',
        pronouns: '', // Add missing field
        title: '', // Add missing field  
        otherName: '', // Add missing field
        aboutCompany: '', // Add missing field
        website: existingClient?.website || '',
        linkedin: existingClient?.linkedin || '',
        latitude: existingClient?.latitude || 0.0,
        longitude: existingClient?.longitude || 0.0,
        mapsLocation: existingClient?.address || '',
        companyLogo: null as File | null,
        existingLogoName: existingClient?.profilePictureUrl || '',
        clientId: existingClient?.id || null,
    });

    $effect(() => {
        if (existingClient) {
            formData = {
                companyName: existingClient.companyName || '',
                ceoFirstName: existingClient.ceoFirstName || '',
                ceoLastName: existingClient.ceoLastName || '',
                jobTitle: existingClient.companyJobTitle || '',
                companyEmail: existingClient.email || '',
                password: '', // Add missing password field
                companyNumber: existingClient.phoneNumber || '',
                companyAddress: existingClient.address || '',
                postalCode: existingClient.postcode || '',
                registrationNumber: existingClient.companyHouseNumber || '',
                pronouns: '', // Add missing pronouns field
                title: '', // Add missing title field
                otherName: '', // Add missing otherName field
                aboutCompany: '', // Add missing aboutCompany field
                website: existingClient.website || '',
                linkedin: existingClient.linkedin || '',
                latitude: existingClient.latitude || 0.0,
                longitude: existingClient.longitude || 0.0,
                mapsLocation: existingClient.address || '',
                companyLogo: null,
                existingLogoName: existingClient.profilePictureUrl || '',
                clientId: existingClient.id || null,
            };
        }
    });

    let errors = $state<Partial<Record<keyof ClientFormData, string>>>({});
    let isSubmitting = $state(false);

    function handleClose() {
        showToast = false;
        dispatch('close');
    }

    async function handleLocationSelect(lat: number, lng: number, address: string) {
        formData.latitude = lat;
        formData.longitude = lng;
        formData.mapsLocation = address;
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            if (!existingClient) {
                errors = {
                    ...errors,
                    companyLogo: 'Company logo is required'
                };
            }
            formData.companyLogo = null;
            return;
        }

        const file = input.files[0];
        formData.companyLogo = file;

        if (errors.companyLogo) {
            delete errors.companyLogo;
            errors = { ...errors };
        }
    }

    async function handleSubmit() {
        try {
            isSubmitting = true;
            errors = {};

            const validation = validateClientForm(formData);

            if (!validation.success) {
                errors = validation.errors;
                console.log('Validation failed:', errors);
                isSubmitting = false;
                return;
            }

            // Prepare client data (without file)
            const clientData = {
                companyName: formData.companyName,
                ceoFirstName: formData.ceoFirstName,
                ceoLastName: formData.ceoLastName,
                companyJobTitle: formData.jobTitle,
                email: formData.companyEmail,
                password: formData.password, // Add password for new clients
                phoneNumber: formData.companyNumber,
                address: formData.companyAddress,
                postcode: formData.postalCode,
                companyHouseNumber: formData.registrationNumber,
                pronouns: formData.pronouns || '', // Add missing field
                title: formData.title || '', // Add missing field
                otherName: formData.otherName || '', // Add missing field
                aboutCompany: formData.aboutCompany || '', // Add missing field
                website: formData.website,
                latitude: formData.latitude,
                longitude: formData.longitude
            };

            let result;
            let clientId = existingClient?.id;

            if (existingClient) {
                // Update existing client using store action
                result = await clientActions.updateClient(existingClient.id, clientData);
                if (result.success) {
                    clientId = existingClient.id;
                }
            } else {
                // Create new client using store action
                result = await clientActions.createClient({
                    ...clientData,
                    email: formData.companyEmail // Include email for new clients
                });
                if (result.success && result.data) {
                    clientId = result.data.id;
                }
            }

            if (!result.success) {
                toastType = 'error';
                toastMessage = result.message || 'An error occurred';
                showToast = true;
                return;
            }

            // Upload profile picture if provided using store action
            if (formData.companyLogo && clientId) {
                const uploadResult = await clientActions.uploadProfilePicture(clientId, formData.companyLogo);
                if (!uploadResult.success) {
                    console.warn('Failed to upload profile picture:', uploadResult.message);
                    // Don't fail the entire operation for image upload failure
                }
            }

            // The store actions already handle data refreshing, so we don't need to manually call fetchClients
            
            if (existingClient) {
                // Get the updated client data from the store
                const updatedClient = await clientActions.getClientById(existingClient.id);
                dispatch('clientAdded', updatedClient);
            } else {
                dispatch('clientAdded', result.data);
                handleClose();
            }

            toastType = 'success';
            toastMessage = existingClient 
                ? 'Company updated successfully'
                : 'Company added successfully';
            showToast = true;

        } catch (error) {
            console.error('Error submitting form:', error);
            toastType = 'error';
            toastMessage = 'An unexpected error occurred';
            showToast = true;
        } finally {
            isSubmitting = false;
        }
    }

    function handleToastClose() {
        showToast = false;
    }
</script>

<div class="relative">
    {#if showModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 py-5">
            <Toast 
                show={showToast}
                message={toastMessage}
                type={toastType}
            />
            <div class="relative my-auto w-full max-w-[95%] rounded-lg bg-white p-8">
                <button
                    onclick={handleClose}
                    class="absolute top-6 right-8 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                >
                    <span style="font-family: 'Material Icons Sharp'; font-weight: normal; font-style: normal; font-size: 24px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; word-wrap: normal; direction: ltr; -webkit-font-smoothing: antialiased;" class="text-gray-400">
                        close
                    </span>
                </button>
                <div class="flex items-center gap-4 mb-6">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        {existingClient ? `Update ${existingClient?.companyName} Details` : 'Add New Company'}
                    </h2>
                    {#if existingClient && existingClient.profilePictureUrl}
                        <div class="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                            <img 
                                src={existingClient.profilePictureUrl !== null ? API_CONFIG.IMAGE_URL + existingClient.profilePictureUrl : ''} 
                                alt={existingClient.companyName}
                                class="w-full h-full object-cover"
                            />
                        </div>
                    {/if}
                </div>
    
                <div class="flex gap-8">
                    <div class="max-h-[70vh] w-[60%] overflow-y-auto pr-5 pl-5">
                        <form onsubmit={(e) => { 
                            e.preventDefault(); 
                            handleSubmit(); 
                        }} class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Company Name"
                                    icon="business"
                                    placeholder="Enter company name"
                                    required={true}
                                    bind:value={formData.companyName}
                                    error={errors.companyName}
                                />
                                <InputField
                                    label="CEO First Name"
                                    icon="person"
                                    placeholder="Enter CEO first name"
                                    bind:value={formData.ceoFirstName}
                                    error={errors.ceoFirstName}
                                />
                                <InputField
                                    label="CEO Last Name"
                                    icon="person"
                                    placeholder="Enter CEO last name"
                                    bind:value={formData.ceoLastName}
                                    error={errors.ceoLastName}
                                />
                                <InputField
                                    label="Job Title"
                                    icon="work"
                                    placeholder="Enter job title"
                                    bind:value={formData.jobTitle}
                                    error={errors.jobTitle}
                                />
                                <InputField
                                    label="Company Email"
                                    type="email"
                                    icon="email"
                                    placeholder="Enter company email"
                                    bind:value={formData.companyEmail}
                                    error={errors.companyEmail}
                                />
                                {#if !existingClient}
                                <InputField
                                    label="Password"
                                    type="password"
                                    icon="lock"
                                    placeholder="Enter password"
                                    required={true}
                                    bind:value={formData.password}
                                    error={errors.password}
                                />
                                {/if}
                                <InputField
                                    label="Company Phone"
                                    type="tel"
                                    icon="phone"
                                    placeholder="Enter company phone number"
                                    bind:value={formData.companyNumber}
                                    error={errors.companyNumber}
                                />
                                <InputField
                                    label="Company Address"
                                    icon="location_on"
                                    placeholder="Enter company address"
                                    bind:value={formData.companyAddress}
                                    error={errors.companyAddress}
                                />
                                <InputField
                                    label="Postal Code"
                                    icon="local_post_office"
                                    placeholder="Enter postal code"
                                    bind:value={formData.postalCode}
                                    error={errors.postalCode}
                                />
                                <InputField
                                    label="Registration Number"
                                    icon="numbers"
                                    placeholder="Enter company registration number"
                                    bind:value={formData.registrationNumber}
                                    error={errors.registrationNumber}
                                />
                                <InputField
                                    label="Website"
                                    type="text"
                                    icon="language"
                                    placeholder="Enter company website"
                                    bind:value={formData.website}
                                    error={errors.website}
                                />
                                <InputField
                                    label="LinkedIn"
                                    type="text"
                                    icon="link"
                                    placeholder="Enter LinkedIn profile URL"
                                    bind:value={formData.linkedin}
                                    error={errors.linkedin}
                                />
                                <InputField
                                    label="Location Coordinates"
                                    icon="location_searching"
                                    placeholder="Click on map to set location"
                                    value={formData.mapsLocation}
                                    readonly={true}
                                    error={errors.mapsLocation}
                                />
                                <div class="col-span-2">
                                    <label for="companyLogo" class="mb-1 block text-sm font-medium text-gray-700">
                                        Company Logo {#if errors.companyLogo}<span class="text-red-500">*</span>{/if}
                                    </label>
                                    <div class="relative">
                                        <span class="material-icons-sharp absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                                            image
                                        </span>
                                        <input
                                            id="companyLogo"
                                            type="file"
                                            accept="image/*"
                                            onchange={handleFileChange}
                                            class="w-full border py-2.5 pr-3 pl-10 {errors.companyLogo
                                                ? 'border-red-500'
                                                : 'border-gray-300'} rounded-lg focus:ring-2 focus:outline-none {errors.companyLogo
                                                ? 'focus:ring-red-400'
                                                : 'focus:ring-gray-400'} transition-all duration-200 file:mr-4
                                                file:rounded-full file:border-0 file:bg-gray-50 file:px-4 file:py-2 file:text-sm file:font-semibold
                                                file:text-gray-700 hover:file:bg-gray-100 focus:border-transparent"
                                        />
                                    </div>
                                    {#if errors.companyLogo}
                                        <p class="mt-1 text-sm text-red-600">{errors.companyLogo}</p>
                                    {/if}
                                </div>
                            </div>
    
                            <div class="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onclick={handleClose}
                                    disabled={isSubmitting}
                                    class="rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    class="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
                                >
                                    {#if isSubmitting}
                                        <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent">
                                        </span>
                                    {/if}
                                    {isSubmitting ? (existingClient ? 'Updating...' : 'Creating...') : (existingClient ? 'Update Company' : 'Add Company')}
                                </button>
                            </div>
                        </form>
                    </div>
    
                    <div class="h-[70vh] w-[40%] overflow-hidden rounded-lg">
                        <GoogleMaps onLocationSelect={handleLocationSelect} />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>