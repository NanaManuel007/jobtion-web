<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade, scale } from 'svelte/transition';
    
    export let show = false;
    export let title = 'Confirm Deletion';
    export let message = 'Are you sure you want to delete this item?';
    export let itemName = '';
    export let isLoading = false;
    
    const dispatch = createEventDispatcher();
    
    function handleConfirm() {
        dispatch('confirm');
    }
    
    function handleCancel() {
        dispatch('cancel');
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            handleCancel();
        }
    }
</script>

{#if show}
    <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 bg-opacity-50 backdrop-blur-sm"
        on:click={handleBackdropClick}
        transition:fade={{ duration: 200 }}
    >
        <div 
            class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Header -->
            <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span class="material-icons-sharp text-red-600 text-xl">warning</span>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">{title}</h3>
                    {#if itemName}
                        <p class="text-sm text-gray-500 mt-1">{itemName}</p>
                    {/if}
                </div>
            </div>
            
            <!-- Message -->
            <div class="mb-6">
                <p class="text-gray-700 leading-relaxed">{message}</p>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end gap-3">
                <button
                    class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    on:click={handleCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 min-w-[80px] justify-center"
                    on:click={handleConfirm}
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {:else}
                        Delete
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}