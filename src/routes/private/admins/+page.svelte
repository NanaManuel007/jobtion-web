<script lang="ts">
  import AllUsersMain from "$lib/components/all_user/AllUsersMain.svelte";

  import { fade } from 'svelte/transition';
  
  let hasPermission = $state(false);
  
  // $effect(() => {
  //   hasPermission = $authStore.user?.permissions?.includes('ReadPermissions') || false;
  // });
</script>

<!-- {#if hasPermission} -->
  <div class="">
    <AllUsersMain/>
  </div>
<!-- {:else}
  <div class="flex items-center justify-center h-screen" in:fade={{ duration: 300 }}>
    <div class="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <div class="text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold mb-2">Access Denied</h2>
      <p class="text-gray-600 mb-4">You don't have permission to access this page. Please contact your administrator if you believe this is an error.</p>
      <a href="/private/home" class="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
        Return to Dashboard
      </a>
    </div>
  </div>
{/if} -->