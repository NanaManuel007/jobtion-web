<script lang="ts">
  import { fade } from 'svelte/transition';
  import Toast from '../../general_components/Toast.svelte';
  import InputComponent from '../../general_components/InputField.svelte';
  import TextField from '../../general_components/TextAreaField.svelte';
  import { onMount, createEventDispatcher } from 'svelte';
  import { permissions, isLoading, error, permissionActions } from '$lib/services/user_roles_and_permission/user.permissions.store';
  import { PERMISSION_CATEGORIES } from '$lib/services/user_roles_and_permission/user.permissions.types';
  import type { Permission } from '$lib/services/user_roles_and_permission/user.permissions.types';

  // Event dispatcher for dialog actions
  const dispatch = createEventDispatcher();

  onMount(async () => {
    // Fetch permissions when component mounts
    await permissionActions.fetchPermissions();
  });
  
  const { isOpen = $bindable(false) } = $props<{ 
    isOpen: boolean, 
  }>();

  // State variables
  let permissionName = $state('');
  let permissionDescription = $state('');
  let permissionCategory = $state('');
  let selectedPermissionId = $state<string | null>(null);
  let isEditing = $state(false);

  // Toast state
  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');

  // Delete confirmation modal
  let showDeleteModal = $state(false);
  let permissionToDelete = $state<{id: string, name: string} | null>(null);
  
  // Loading states
  let isSaving = $state(false);
  let isDeleting = $state(false);

  // Close the dialog
  function closeDialog() {
    dispatch('close');
  }

  function showSuccessToast(message: string) {
    toastMessage = message;
    toastType = 'success';
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  function showErrorToast(message: string) {
    toastMessage = message;
    toastType = 'error';
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  function resetForm() {
    permissionName = '';
    permissionDescription = '';
    permissionCategory = '';
    selectedPermissionId = null;
    isEditing = false;
  }

  function selectPermission(permission: Permission) {
    if (!permission) return;
    
    selectedPermissionId = permission.id;
    permissionName = permission.name;
    permissionDescription = permission.description;
    permissionCategory = permission.category;
    isEditing = true;
  }

  async function savePermission() {
    if (!permissionName.trim() || !permissionCategory.trim()) {
      showErrorToast('Permission name and category are required');
      return;
    }

    isSaving = true;
    
    try {
      const permissionData = {
        name: permissionName.trim(),
        description: permissionDescription.trim(),
        category: permissionCategory.trim()
      };

      let result;
      if (isEditing && selectedPermissionId) {
        result = await permissionActions.updatePermission({
          id: selectedPermissionId,
          ...permissionData
        });
      } else {
        result = await permissionActions.addPermission(permissionData);
      }

      if (result.success) {
        showSuccessToast(result.message);
        resetForm();
      } else {
        showErrorToast(result.message);
      }
    } catch (error) {
      showErrorToast('An error occurred while saving the permission');
    } finally {
      isSaving = false;
    }
  }

  function confirmDelete(permission: Permission) {
    permissionToDelete = { id: permission.id, name: permission.name };
    showDeleteModal = true;
  }

  async function deletePermission() {
    if (!permissionToDelete) return;

    isDeleting = true;
    
    try {
      const result = await permissionActions.deletePermission(permissionToDelete.id);
      
      if (result.success) {
        showSuccessToast(result.message);
        const deletedPermissionId = permissionToDelete.id;
        
        showDeleteModal = false;
        permissionToDelete = null;
        if (selectedPermissionId === deletedPermissionId) {
          resetForm();
        }
      } else {
        showErrorToast(result.message);
      }
    } catch (error) {
      showErrorToast('An error occurred while deleting the permission');
    } finally {
      isDeleting = false;
    }
  }

  function cancelDelete() {
    showDeleteModal = false;
    permissionToDelete = null;
  }

  // Group permissions by category
  const groupedPermissions = $derived($permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>));
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-50"transition:fade>
    <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Manage Permissions</h2>
          <button
            onclick={closeDialog}
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span class="material-icons-sharp">close</span>
          </button>
        </div>
      </div>

      <div class="flex h-[calc(90vh-80px)]">
        <!-- Left Panel - Permission Form -->
        <div class="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {isEditing ? 'Edit Permission' : 'Add New Permission'}
          </h3>

          <form onsubmit={(e) => { e.preventDefault(); savePermission(); }} class="space-y-4">
            <InputComponent
              bind:value={permissionName}
              label="Permission Name"
              placeholder="e.g., Users.Create"
              required
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                bind:value={permissionCategory}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {#each PERMISSION_CATEGORIES as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </div>

            <TextField
              bind:value={permissionDescription}
              label="Description"
              placeholder="Describe what this permission allows"
              rows={3}
              icon=""
            />

            <div class="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving || $isLoading}
                class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {#if isSaving}
                  <span class="flex items-center justify-center gap-2">
                    <span class="animate-spin material-icons-sharp text-sm">refresh</span>
                    Saving...
                  </span>
                {:else}
                  {isEditing ? 'Update Permission' : 'Add Permission'}
                {/if}
              </button>

              {#if isEditing}
                <button
                  type="button"
                  onclick={resetForm}
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              {/if}
            </div>
          </form>
        </div>

        <!-- Right Panel - Permissions List -->
        <div class="flex-1 p-6 overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Existing Permissions</h3>
            <span class="text-sm text-gray-500">
              {$permissions.length} permission{$permissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {#if $isLoading}
            <div class="flex items-center justify-center py-8">
              <span class="animate-spin material-icons-sharp text-2xl text-gray-400">refresh</span>
            </div>
          {:else if $error}
            <div class="text-center py-8">
              <p class="text-red-600">{$error}</p>
              <button
                onclick={() => permissionActions.fetchPermissions()}
                class="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          {:else if $permissions.length === 0}
            <div class="text-center py-8 text-gray-500">
              <span class="material-icons-sharp text-4xl mb-2 block">security</span>
              <p>No permissions found</p>
            </div>
          {:else}
            <div class="space-y-6">
              {#each Object.entries(groupedPermissions) as [category, categoryPermissions]}
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 class="font-medium text-gray-900">{category}</h4>
                    <span class="text-sm text-gray-500">{categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div class="divide-y divide-gray-200">
                    {#each categoryPermissions as permission}
                      <div class="p-4 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h5 class="font-medium text-gray-900">{permission.name}</h5>
                            {#if permission.description}
                              <p class="text-sm text-gray-600 mt-1">{permission.description}</p>
                            {/if}
                            <p class="text-xs text-gray-400 mt-1">ID: {permission.id}</p>
                          </div>
                          <div class="flex gap-2 ml-4">
                            <button
                              onclick={() => selectPermission(permission)}
                              class="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit permission"
                            >
                              <span class="material-icons-sharp text-sm">edit</span>
                            </button>
                            <button
                              onclick={() => confirmDelete(permission)}
                              class="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete permission"
                            >
                              <span class="material-icons-sharp text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60" transition:fade>
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="material-icons-sharp text-red-600">warning</span>
          <h3 class="text-lg font-semibold text-gray-900">Delete Permission</h3>
        </div>
        
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete the permission "{permissionToDelete?.name}"? This action cannot be undone.
        </p>
        
        <div class="flex gap-3 justify-end">
          <button
            onclick={cancelDelete}
            disabled={isDeleting}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onclick={deletePermission}
            disabled={isDeleting}
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {#if isDeleting}
              <span class="flex items-center gap-2">
                <span class="animate-spin material-icons-sharp text-sm">refresh</span>
                Deleting...
              </span>
            {:else}
              Delete
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Toast Component -->
<Toast
  bind:show={showToast}
  message={toastMessage}
  type={toastType}
/>