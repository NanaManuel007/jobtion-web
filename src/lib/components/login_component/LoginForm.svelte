<script lang="ts">
  import { goto } from '$app/navigation';
  import SocialIcons from './SocialIcons.svelte';
  import Toast from './Toast.svelte';
  import { AuthService } from '$lib/services/authentication_services/auth.services';
  
  // export let isActive: boolean;
    const { isActive = '' } = $props<{ isActive?: boolean }>();
  let email = $state('');
  let password = $state('');
  let showToast = $state(false);
  let toastMessage = $state('');
  let isLoading = $state(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toastMessage = 'Please fill in all fields';
      showToast = true;
      setTimeout(() => showToast = false, 3000);
      return;
    }

    try {
      isLoading = true;
      const result = await AuthService.login({ email, password });

      if (result.success) {
        goto('/private/home');
      } else {
        toastMessage = result.message;
        showToast = true;
      }
    } finally {
      isLoading = false;
      setTimeout(() => showToast = false, 3000);
    }
  };
</script>

<Toast message={toastMessage} show={showToast} />

<div class="absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 z-2" 
     class:translate-x-full={isActive}>
  <form class="bg-white flex flex-col items-center justify-center h-full px-10" on:submit|preventDefault={handleSubmit}>
    <h1 class="text-2xl font-bold mb-4">Sign In</h1>
    <SocialIcons />
    <span class="text-sm mb-4">or use your email password</span>
    <input 
      type="email" 
      placeholder="Email" 
      bind:value={email}
      class="bg-[#eee] border-none my-2 px-4 py-2 text-sm rounded-lg w-full outline-none"
      disabled={isLoading}
    >
    <input 
      type="password" 
      placeholder="Password" 
      bind:value={password}
      class="bg-[#eee] border-none my-2 px-4 py-2 text-sm rounded-lg w-full outline-none"
      disabled={isLoading}
    >
    <a href="/" class="text-sm text-gray-700 no-underline my-4">Forget Your Password?</a>
    <button 
    type="submit" 
    class="bg-[#512da8] text-white text-sm px-11 py-2.5 border border-transparent rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer flex items-center justify-center min-w-[160px]"
    disabled={isLoading}
  >
    {#if isLoading}
      <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    {/if}
    {isLoading ? 'Signing In...' : 'Sign In'}
  </button>
  </form>
</div>