<script lang="ts">
  import SideBarItems from './SideBarItems.svelte';
  import { page } from '$app/stores';
  import { AuthService } from '$lib/services/authentication_services/auth.services';
  import { goto } from '$app/navigation';

  let isOpen = $state(true);

  const menuItems = $state([
      { icon: 'dashboard', title: 'Dashboard', href: '/private/home', },
      { icon: 'groups', title: 'Clients', href: '/private/all_clients' },
      { icon: 'person_outline', title: 'Candidates', href: '/private/all_candidates' },
    //   { icon: 'menu_book', title: 'All Bookings', href: '/private/all_bookings' },
      { icon: 'receipt_long', title: 'All Applications', href: '/private/all_applications' },
      { icon: 'alarm', title: 'All Internal Jobs and TSM', href: '/private/app_approval' },
      { icon: 'insights', title: 'Analytics', href: '/private/analytics' },
      { icon: 'report_gmailerrorred', title: 'Reports', href: '/private/reports' },
      { icon: 'add', title: 'All Admins', href: '/private/admins' },
    //   { icon: 'settings', title: 'Settings', href: '/dashboard/settings' },
      { icon: 'logout', title: 'Logout', href: '/', onClick: handleLogout }
  ]);

  const currentPath = $derived($page.url.pathname);
 
  async function handleLogout() {
    await AuthService.logout();
    await goto('/');
  }



  function toggleSidebar() {
    isOpen = !isOpen;
  }
</script>



<main class="transition-all duration-300"
    class:ml-72={isOpen}
    class:ml-20={!isOpen}>
    <aside class="h-screen fixed left-0 top-0 z-50 transition-all duration-300"
    class:w-72={isOpen}
    class:w-25={!isOpen}>
    <div class="flex items-center justify-between mt-5 px-4">
        {#if isOpen}
            <div class="flex gap-2">
                <h1 class="text-2xl font-semibold text-[#000000]">
                    Job<span class="text-[#450a9c]">tion</span>
                </h1>
            </div>
        {/if}
        <button 
            class="pr-4 cursor-pointer"
            onclick={toggleSidebar}
        >
            <span class="material-icons-sharp">
                {isOpen ? 'close' : 'menu'}
            </span>
        </button>
    </div>

    <div class="flex flex-col bg-white shadow-[0_2rem_3rem_rgba(132,139,200,0.18)] 
                transition-all duration-300 rounded-[15px] h-[88vh] relative top-6 mx-4">
        {#each menuItems as item}
            <SideBarItems 
                {...item} 
                isActive={currentPath === item.href} 
                isOpen={isOpen}
                onClick={item.onClick}
            />
        {/each}
    </div>
</aside>
</main>