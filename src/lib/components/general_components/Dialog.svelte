<script lang="ts">
    import { fade, fly } from "svelte/transition";
    export let show = false;
    export let title: string;
    export let onClose: () => void;

    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }
</script>

{#if show}
    <div
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        on:click={handleBackdropClick}
        on:keydown={e => {
            if (e.key === 'Escape') onClose();
        }}
        class="fixed inset-0 z-50 overflow-y-auto"
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 150 }}
    >
        <!-- Backdrop with subtle gradient -->
        <div class="fixed inset-0 bg-gradient-to-br from-black/30 to-black/40 backdrop-blur-[2px]"></div>

        <!-- Dialog position -->
        <div class="min-h-screen px-4 text-center">
            <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

            <!-- Dialog panel -->
            <div 
                class="inline-block w-full max-w-md text-left align-middle bg-white rounded-2xl shadow-2xl transform transition-all"
                in:fly={{ y: 20, duration: 300 }}
                out:fly={{ y: 20, duration: 200 }}
            >
                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-100">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-semibold text-gray-800">
                            {title}
                        </h3>
                        <button 
                            class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all"
                            on:click={onClose}
                        >
                            <span class="material-icons-sharp text-lg">close</span>
                        </button>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="px-6 py-5">
                    <div class="text-gray-600">
                        <slot />
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="px-6 py-4 border-t border-gray-100">
                    <div class="flex justify-end gap-3">
                        <slot name="actions" />
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    div[role="dialog"] {
        perspective: 1500px;
    }
</style>