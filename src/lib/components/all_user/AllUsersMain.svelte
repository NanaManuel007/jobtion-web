<script lang="ts">
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  import Dialog from '../general_components/Dialog.svelte';
  import Toast from '../general_components/Toast.svelte';
  import Roles from './roles/Roles.svelte';
  import AddNewUser from './add_user/AddNewUser.svelte';
  import type { SystemUser } from '$lib/services/system_user_services/system.user.types';
  import { systemUsers, isLoading, error, selectedUser, systemUserActions } from '$lib/services/system_user_services/system.user.store';
  import { auth } from '$lib/services/authentication_services/auth.store';
  
  // State variables
  let mounted = $state(false);
  let searchTerm = $state('');
  let showDeleteDialog = $state(false);
  let showAddUserDialog = $state(false);
  let showRolesDialog = $state(false);

  // Pagination variables
  let currentPage = $state(1);
  const itemsPerPage = 10;
  let totalPages = $state(1);
  let paginatedUsers = $state<SystemUser[]>([]);


  

  async function loadUsers() {
    if (auth.checkTokenExpiration()) {
      return;
    }
    
    await systemUserActions.fetchSystemUsers();
    updatePaginatedUsers();
  }

  function updatePaginatedUsers() {
    if (!$systemUsers.length) return;

    // Filter users based on search term
    const filteredUsers = $systemUsers.filter(user => 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.roleName && user.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    // Calculate total pages
    totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

    // Adjust current page if needed
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    // Get paginated users
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  }
  // Initialize on mount
  onMount(() => {
    searchTerm = '';
    loadUsers();
    mounted = true;
  });

  function openAddUserDialog() {
    searchTerm = '';
    showAddUserDialog = true;
  }
  
  async function handleCloseAddUserDialog() {
    searchTerm = '';
    showAddUserDialog = false;
    await loadUsers();
  }
  
  function openRolesDialog() {
    showRolesDialog = true;
  }
  
  async function handleCloseRolesDialog() {
    showRolesDialog = false;
    await loadUsers();
  }

  // Watch for search term changes
  $effect(() => {    
      currentPage = 1; // Reset to first page when searching
      updatePaginatedUsers();
  });

  // Watch for systemUsers changes
  // $effect(() => {
  //   if (mounted) {
  //     updatePaginatedUsers();
  //   }
  // });

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      updatePaginatedUsers();
    }
  }

  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType = $state<'success' | 'error'>('success');

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

  function handleEdit(user: SystemUser) {
    // systemUserActions.selectUser(user);
    // Open edit dialog or navigate to edit page
    console.log('Edit user:', user);
  }

  async function handleDelete() {
    if ($selectedUser) {
      try {
        // Here you would call a delete method from systemUserActions
        // For now, we'll just refresh the list
        showSuccessToast('User deleted successfully');
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        showErrorToast('Failed to delete user');
      }
      showDeleteDialog = false;
      systemUserActions.selectUser(null);
    }
  }
</script>


<AddNewUser 
  isOpen={showAddUserDialog} 
  on:close={handleCloseAddUserDialog} 
/>

<Roles 
  isOpen={showRolesDialog} 
  on:close={handleCloseRolesDialog} 
/>

<Toast 
  show={showToast}
  message={toastMessage}
  type={toastType}
/>

<!-- {#if showDeleteDialog && $selectedUser}
  <Dialog
    show={showDeleteDialog}
    title="Confirm Deletion"
    onClose={() => showDeleteDialog = false}
  >
    <p class="text-gray-600">
      Are you sure you want to delete user {$selectedUser?.email}?
    </p>
    
    <svelte:fragment slot="actions">
      <button
        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        onclick={() => showDeleteDialog = false}
      >
        Cancel
      </button>
      <button
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        onclick={handleDelete}
      >
        Delete
      </button>
    </svelte:fragment>
  </Dialog>
{/if} -->

{#if mounted}
  <div class="pt-10 pr-10 pl-10">
    <main class="bg-white rounded-2xl shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] transition-all duration-300" in:fade={{ duration: 1000 }}>
      <section class="w-full overflow-hidden">
        <div class="w-full bg-white/25 p-6 flex items-center">
          <h1 class="text-3xl font-semibold">System Users</h1>
          <div class="flex-grow"></div>
          <div class="flex items-center gap-4">
            <div class="relative">
              <input
                type="text"
                placeholder="Search users..."
                bind:value={searchTerm}
                class="border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:border-grey-500"
              />
              <span class="material-icons-sharp absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                search
              </span>
            </div>
            <button
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              onclick={openAddUserDialog}
            >
              <span class="material-icons-sharp">add</span>
              Add User
            </button>
            <button
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              onclick={openRolesDialog}
            >
              <span class="material-icons-sharp">add</span>
              Add Role
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left p-4 font-medium text-gray-600">User ID</th>
                <th class="text-left p-4 font-medium text-gray-600">Email</th>
                <th class="text-left p-4 font-medium text-gray-600">Full Name</th>
                <th class="text-left p-4 font-medium text-gray-600">Role</th>
                <th class="text-left p-4 font-medium text-gray-600">Permissions</th>
                <th class="text-center p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#if $isLoading}
                <tr>
                  <td colspan="5" class="p-4 text-center">
                    <div class="flex justify-center items-center space-x-2">
                      <div class="w-4 h-4 rounded-full bg-gray-400 animate-pulse"></div>
                      <div class="w-4 h-4 rounded-full bg-gray-400 animate-pulse"></div>
                      <div class="w-4 h-4 rounded-full bg-gray-400 animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              {:else if $error}
                <tr>
                  <td colspan="5" class="p-4 text-center text-red-500">
                    {$error}
                  </td>
                </tr>
              {:else if paginatedUsers.length === 0}
                <tr>
                  <td colspan="5" class="p-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              {:else}
                {#each paginatedUsers as user}
                  <tr class="border-b border-gray-100 hover:bg-gray-50/50">
                    <td class="p-4">
                      <span class="font-mono text-sm">{user.id}</span>
                    </td>
                    <td class="p-4">{user.email}</td>
                    <td class="p-4">{user.fullName}</td>
                    <td class="p-4">
                      <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {user.roleName || 'No Role'}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex flex-wrap gap-1">
                        {#if user.access && user.access.length > 0}
                          {#each user.access as permission, i}
                            {#if i < 3}
                              <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                {permission}
                              </span>
                            {:else if i === 3}
                              <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                +{user.access.length - 3} more
                              </span>
                            {/if}
                          {/each}
                        {:else}
                          <span class="text-gray-500 text-sm">No permissions</span>
                        {/if}
                      </div>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-center gap-3">
                        <button
                          class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                          onclick={() => handleEdit(user)}
                          title="Edit User"
                        >
                          <span class="material-icons-sharp text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        {#if totalPages > 1}
          <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, paginatedUsers.length)} of {$systemUsers.length} entries
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1 rounded-lg border {currentPage === 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}"
                onclick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {#each Array(totalPages) as _, i}
                {#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
                  <button
                    class="w-8 h-8 rounded-lg flex items-center justify-center {
                      currentPage === i + 1
                        ? 'bg-grey-500 text-white'
                        : 'hover:bg-gray-50'
                    }"
                    onclick={() => goToPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                {:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
                  <span class="px-1">...</span>
                {/if}
              {/each}
              
              <button
                class="px-3 py-1 rounded-lg border {currentPage === totalPages ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50'}"
                onclick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        {/if}
      </section>
    </main>
  </div>
{/if}