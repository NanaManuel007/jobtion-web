<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/services/authentication_services/auth.store';
	import { onMount } from 'svelte';

  const { 
    icon, 
    title, 
    href, 
    isActive = false, 
    messageCount, 
    isOpen = false, 
    onClick 

  } = $props<{
    icon: string;
    title: string;
    href: string;
    isActive?: boolean;
    messageCount?: number;
    isOpen: boolean;
    onClick?: (() => Promise<void> | void);
  }>();
  onMount(() => {
    auth.initialize();
  });

  function handleClick(event: MouseEvent) {
  event.preventDefault();
  if (onClick) {
    onClick();
  } else {
    // Use goto with replaceState: false to preserve history
    goto(href, { replaceState: false });
  }
}
</script>

<a 
    {href}
    onclick={handleClick}
    class={`
    rounded-2xl
        hover:ml-5 py-3 px-5 
        flex items-center text-[#7d8da1] h-14 gap-2 relative
        transition-all duration-300 hover:text-[#6C9BCF]
        ${isActive ? 'text-[#6C9BCF] bg-[rgba(132,139,200,0.18)] ml-0 before:content-[""] before:absolute before:left-0 before:w-1.5 before:h-[18px] before:bg-[#6C9BCF]' : ''}
        last:absolute last:bottom-8 last:w-full
    `}
>
    <span class={`
        material-icons-sharp text-2xl transition-all duration-300
        ${isActive ? 'text-[#6C9BCF] ml-[calc(1rem_-_3px)]' : ''}
    `}>
        {icon}
    </span>
    {#if isOpen}
        <h3 class="font-medium text-sm">{title}</h3>
        {#if messageCount}
            <span class="bg-[#FF0060] py-0.5 px-1.5 text-white text-xs rounded">
                {messageCount}
            </span>
        {/if}
    {/if}
</a>