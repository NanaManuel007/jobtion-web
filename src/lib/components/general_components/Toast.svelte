<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import { onMount, onDestroy } from 'svelte';

    export let show = false;
    export let message: string;
    export let type: 'success' | 'error' = 'success';
    export let duration = 3000;

    let timer: ReturnType<typeof setTimeout>;
    let progress: any;

    function resetProgress() {
        progress = tweened(0, {
            duration,
            easing: cubicOut
        });
    }

    function startTimer() {
        resetProgress();
        progress.set(100);
        clearTimeout(timer);
        timer = setTimeout(() => {
            show = false;
        }, duration);
    }

    $: if (show) {
        startTimer();
    }

    onMount(() => {
        resetProgress();
    });

    onDestroy(() => {
        clearTimeout(timer);
    });
</script>

{#if show}
    <div
        class="fixed top-4 right-4 z-50"
        in:fly={{ x: 20, duration: 300 }}
        out:fade={{ duration: 200 }}
    >
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg min-w-[320px] relative">
            <div class="flex-shrink-0">
                {#if type === 'success'}
                    <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span class="material-icons-sharp text-white text-xl">check</span>
                    </div>
                {:else if type === 'error'}
                    <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <span class="material-icons-sharp text-white text-xl">error</span>
                    </div>
                {/if}
            </div>
            <div class="flex-1">
                <h4 class="font-medium text-gray-900">{type === 'success' ? 'Success' : 'Error'}</h4>
                <p class="text-gray-500">{message}</p>
            </div>
            <button 
                class="flex-shrink-0 text-gray-400 hover:text-gray-600"
                on:click={() => show = false}
            >
                <span class="material-icons-sharp">close</span>
            </button>
            
            <!-- Progress bar -->
            <div class="absolute bottom-0 left-0 h-1 bg-gray-100 w-full overflow-hidden rounded-b-lg">
                <div
                    class="h-full transition-all duration-300 {type === 'success' ? 'bg-blue-500' : 'bg-red-500'}"
                    style="width: {100 - $progress}%"
                />
            </div>
        </div>
    </div>
{/if}

<style>
    :global(.material-icons-sharp) {
        font-size: 20px;
    }
</style>