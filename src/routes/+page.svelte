<script lang="ts">
  import { fade, slide } from 'svelte/transition'; 
  import { auth } from '$lib/services/authentication_services/auth.store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import LoginForm from '$lib/components/login_component/LoginForm.svelte';
  import TogglePanel from '$lib/components/login_component/TogglePanel.svelte';

  let mounted = false;
  let isActive = false;
    
  const toggleActive = () => {
    isActive = !isActive;
  };

  onMount(() => {
    mounted = true;
    auth.initialize();
    
    // AuthService already handles token storage, just check if it exists
    // if (localStorage.getItem('access_token')) {
    //   auth.setAuthenticated(true);
    //   goto('/private/home');
    // }

    // Listen for authentication changes
    auth.subscribe(({ isAuthenticated }) => {
      if (isAuthenticated) {
        goto('/private/home');
      }
    });
  });
</script>

{#if mounted}
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]"
       in:fade={{ duration: 1000, delay: 200 }}>
    <div class="bg-white rounded-[30px] shadow-lg relative overflow-hidden w-[768px] max-w-full min-h-[480px]" 
         class:active={isActive}
         in:slide={{ duration: 1000, delay: 300 }}>
      <LoginForm {isActive} />
      <TogglePanel {isActive} on:toggle={toggleActive} />
    </div>
  </div>
{/if}