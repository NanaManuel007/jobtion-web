<script lang="ts">



    import SideBar from '$lib/components/home_compents/sidebar/SideBar.svelte';
	
</script>
<!-- {#if $auth.isAuthenticatedn} -->
    <div class="flex">
        <SideBar />
        <div class="flex-1">
            <slot />
        </div>
    </div>
<!-- {/if} -->



              