<script lang="ts">
    import Dialog from './Dialog.svelte';
    
    export let show = false;
    export let title = 'Confirm Action';
    export let message = 'Are you sure you want to proceed?';
    export let confirmText = 'Confirm';
    export let cancelText = 'Cancel';
    export let onConfirm: () => void;
    export let onCancel: () => void;
    export let isDestructive = false;
</script>

<Dialog {show} {title} onClose={onCancel}>
    <div class="space-y-4">
        <div class="flex items-start gap-3">
            {#if isDestructive}
                <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span class="material-icons-sharp text-red-600 text-lg">warning</span>
                </div>
            {:else}
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span class="material-icons-sharp text-blue-600 text-lg">help</span>
                </div>
            {/if}
            <div class="flex-1">
                <p class="text-gray-700 leading-relaxed">{message}</p>
            </div>
        </div>
    </div>
    
    <svelte:fragment slot="actions">
        <button
            class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            on:click={onCancel}
        >
            {cancelText}
        </button>
        <button
            class="px-4 py-2 {isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-colors"
            on:click={onConfirm}
        >
            {confirmText}
        </button>
    </svelte:fragment>
</Dialog>