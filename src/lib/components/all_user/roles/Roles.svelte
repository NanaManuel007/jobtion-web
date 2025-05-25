<script lang="ts">
  import { fade } from 'svelte/transition';
  import Toast from '../../general_components/Toast.svelte';
  import InputComponent from '../../general_components/InputField.svelte';
  import TextField from '../../general_components/TextAreaField.svelte';
  import { onMount, createEventDispatcher } from 'svelte';
  import { roles, isLoading, error, roleActions } from '$lib/services/user_roles_and_permission/user.roles.store';
  import { ROLE_ACCESS_LIST } from '$lib/services/user_roles_and_permission/user.roles.types';

  // Event dispatcher for dialog actions
  const dispatch = createEventDispatcher();

  // Create permissions data from ROLE_ACCESS_LIST
  const permissionsItems = ROLE_ACCESS_LIST.map((permission, index) => ({
    id: index + 1,
    name: permission,
    description: getPermissionDescription(permission)
  }));

  // Helper function to generate descriptions for permissions
  function getPermissionDescription(permission: string): string {
    const actionMap: Record<string, string> = {
      'Create': 'Create new',
      'Delete': 'Delete existing',
      'Update': 'Modify existing',
      'View': 'View details of',
      'ViewAll': 'View all',
      'Read': 'Read',
      'See': 'Access to'
    };

    const resourceMap: Record<string, string> = {
      'User': 'users',
      'Client': 'clients',
      'Job': 'jobs',
      'JobApplication': 'job applications',
      'Roles': 'roles',
      'Analytics': 'analytics data',
      'Reports': 'reports',
      'Financials': 'financial data'
    };

    // Special cases
    if (permission === 'AllAdmin') return 'Full administrative access';

    // Try to parse the permission name
    for (const action in actionMap) {
      if (permission.startsWith(action)) {
        const remainingPart = permission.substring(action.length);
        for (const resource in resourceMap) {
          if (remainingPart === resource) {
            return `${actionMap[action]} ${resourceMap[resource]}`;
          }
        }
      }
    }

    // Fallback for permissions that don't match the pattern
    return `Permission to ${permission.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`;
  }

  onMount(async () => {
    // Fetch roles when component mounts
    await roleActions.fetchRoles();
  });
  
  const { isOpen = $bindable(false),} = $props<{ 
        isOpen: boolean, 
    }>();

  // State variables
  let roleName = $state('');
  let roleDescription = $state('');
  let isActive = $state(true);
  let selectedRoleId = $state<number | null>(null);
  let isEditing = $state(false);
  
  // Selected permissions
  let selectedPermissions = $state<string[]>([]);
  // Track original permissions for comparison
  let originalPermissions = $state<string[]>([]);

  // Toast state
  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');

  // Delete confirmation modal
  let showDeleteModal = $state(false);
  let roleToDelete = $state<{id: number, name: string} | null>(null);
  
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
    roleName = '';
    roleDescription = '';
    isActive = true;
    selectedPermissions = [];
    originalPermissions = [];
    selectedRoleId = null;
    isEditing = false;
  }

  function selectRole(role: any) {
    if (!role || role === null) return;
    
    selectedRoleId = role.id || null;
    roleName = role.role_name || role.name || '';
    roleDescription = role.role_description || role.description || '';
    isActive = role.isActive ?? true;
    
    // Get permissions from the role data
    if (role.access && Array.isArray(role.access)) {
      selectedPermissions = [...role.access];
      originalPermissions = [...role.access];
    } else if (role.rolePermissions && Array.isArray(role.rolePermissions)) {
      const permissions = role.rolePermissions
        .filter((p: { permissionName: string }) => p && p.permissionName)
        .map((p: any) => p.permissionName);
      selectedPermissions = [...permissions];
      originalPermissions = [...permissions];
    } else {
      selectedPermissions = [];
      originalPermissions = [];
    }
    
    isEditing = true;
  }

  function togglePermission(permission: string) {
    if (selectedPermissions.includes(permission)) {
      selectedPermissions = selectedPermissions.filter(p => p !== permission);
    } else {
      selectedPermissions = [...selectedPermissions, permission];
    }
  }

  function confirmDeleteRole(role: any, event: Event) {
    // Prevent the click from propagating to the parent (which would select the role)
    event.stopPropagation();
    
    // Enhanced validation to prevent null IDs
    if (!role || !role.id) {
      showErrorToast('Cannot delete role: Invalid role ID');
      return;
    }
    
    if (!role.name) {
      role.name = 'Unnamed Role'; // Fallback name if missing
    }
    
    roleToDelete = { id: role.id, name: role.name };
    showDeleteModal = true;
  }

  async function handleDeleteRole() {
    if (!roleToDelete) return;
    
    isDeleting = true;
    
    try {
      const result = await roleActions.deleteRole(roleToDelete.id);
      
      if (result.success) {
        showSuccessToast(`Role "${roleToDelete.name}" deleted successfully`);
        
        // Reset selection if the deleted role was selected
        if (selectedRoleId === roleToDelete.id) {
          resetForm();
        }
      } else {
        showErrorToast(result.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      showErrorToast('Failed to delete role');
    } finally {
      isDeleting = false;
      showDeleteModal = false;
      roleToDelete = null;
    }
  }
  
  async function handleSaveRole() {
  if (!roleName.trim()) {
    showErrorToast('Role name is required');
    return;
  }
  
  isSaving = true;
  
  try {
    const roleData = {
      role_name: roleName,
      role_description: roleDescription,
      access: selectedPermissions
    };
    
    let result;
    
    if (isEditing && selectedRoleId) {
      // Include the id property for updates
      result = await roleActions.updateRole({
        ...roleData,
        id: selectedRoleId
      });
    } else {
      result = await roleActions.addRole({...roleData,
      id: -1
      });
    }
    
    if (result.success) {
      showSuccessToast(result.message || `Role ${isEditing ? 'updated' : 'created'} successfully`);
      if (!isEditing) {
        resetForm();
      }
    } else {
      showErrorToast(result.message || `Failed to ${isEditing ? 'update' : 'create'} role`);
    }
  } catch (error) {
    console.error(`Error ${isEditing ? 'updating' : 'creating'} role:`, error);
    showErrorToast(`Failed to ${isEditing ? 'update' : 'create'} role`);
  } finally {
    isSaving = false;
  }
}
</script>

<Toast 
  show={showToast}
  message={toastMessage}
  type={toastType}
/>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-900/5 backdrop-blur-[2px] flex items-center justify-center z-50" transition:fade={{ duration: 200 }}>
    <!-- Delete Confirmation Modal -->
    {#if showDeleteModal}
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <button 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            onclick={() => { showDeleteModal = false; roleToDelete = null; }}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            onclick={handleDeleteRole}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-gray-800">Role Management</h2>
          <button 
            class="text-gray-500 hover:text-gray-700"
            onclick={closeDialog}
            aria-label="Close dialog"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          <div class="flex flex-col md:flex-row">
            <!-- Roles List (Left Side) -->
            <div class="w-full md:w-1/2 p-6 border-r border-gray-200">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-700">Available Roles</h3>
              </div>

              {#if $isLoading}
                <div class="py-4 text-center text-gray-500">Loading roles...</div>
              {:else if $error}
                <div class="py-4 text-center text-red-500">
                  Error loading roles: {$error}
                </div>
              {:else if !$roles || $roles.length === 0}
                <div class="py-4 text-center text-gray-500">No roles found</div>
              {:else}
                <div class="space-y-2 max-h-[500px] overflow-y-auto">
                  {#each $roles as role}
                    {#if role}
                      <div 
                        role="button"
                        tabindex="0"
                        onkeydown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            selectRole(role);
                          }
                        }}
                        class="p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 {selectedRoleId === role.id ? 'bg-gray-100 border-gray-400' : 'border-gray-200'}"
                        onclick={() => selectRole(role)}
                      >
                        <div class="flex justify-between items-center">
                          <div>
                            <h4 class="font-medium text-gray-800">{role.role_name || 'Unnamed Role'}</h4>
                            {#if role.role_description}
                              <p class="text-sm text-gray-600 mt-1">{role.role_description}</p>
                            {/if}
                          </div>
                          <div class="flex items-center space-x-2">
                            <span class="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                            <button
                              aria-label="Delete role"
                              class="p-1 text-red-500 hover:text-red-700 transition-colors"
                              onclick={(e) => {
                                console.log('Role being deleted:', role); // Debug log
                                if (role && role.id) {
                                  confirmDeleteRole({id: role.id, name: role.role_name || 'Unnamed Role'}, e);
                                } else {
                                  e.stopPropagation();
                                  showErrorToast('Cannot delete role: Missing role ID');
                                }
                              }}
                              title="Delete role"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Show role permissions -->
                        {#if selectedRoleId === role.id}
                          <div class="mt-3 pt-3 border-t border-gray-100">
                            <h5 class="text-sm font-medium text-gray-700 mb-2">Role Permissions:</h5>
                            
                            {#if !role.access || role.access.length === 0}
                              <div class="text-sm text-gray-500">No permissions assigned</div>
                            {:else}
                              <div class="flex flex-wrap gap-1">
                                {#each role.access as permission}
                                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {permission}
                                  </span>
                                {/each}
                              </div>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>

            <!-- Role Form (Right Side) -->
            <div class="w-full md:w-1/2 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-700">{isEditing ? 'Edit Role' : 'Add New Role'}</h3>
                {#if isEditing}
                  <button 
                    class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    onclick={resetForm}
                  >
                    New Role
                  </button>
                {/if}
              </div>

              <div class="space-y-4">
                <InputComponent
                  label="Role Name *"
                  placeholder="Enter role name"
                  bind:value={roleName}
                  required={true}
                  icon=""
                />
                
                <TextField
                  icon=""
                  label="Description"
                  placeholder="Enter role description"
                  bind:value={roleDescription}
                  rows={3}
                />
                
                <div class="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    bind:checked={isActive}
                    class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label for="isActive" class="ml-2 block text-sm text-gray-700">Active</label>
                </div>
                <div>
                  <label 
                  role="Permissions"
                  class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  
                  {#if $isLoading}
                    <div class="py-2 text-sm text-gray-500">Loading permissions...</div>
                  {:else}
                    <div class="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {#each permissionsItems as permission}
                        {#if permission && permission.name}
                          <div class="flex items-center">
                            <input
                              id={permission.name}
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.name)}
                              onchange={() => togglePermission(permission.name)}
                              class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            />
                            <div class="ml-2">
                              <label for={permission.name} class="block text-sm text-gray-700">
                                {permission.name}
                              </label>
                              {#if permission.description}
                                <p class="text-xs text-gray-500">{permission.description}</p>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}
                </div>
                <div class="flex justify-end mt-6">
                  <button
                    class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    onclick={handleSaveRole}
                    disabled={isSaving}
                  >
                    {isSaving
                      ? 'Saving...' 
                      : isEditing 
                        ? 'Update Role' 
                        : 'Create Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}