<script lang="ts">
    export let percentage: number;
    export let color: string;
    export let label: string;
    export let value: number;

    import { onMount } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    const progress = tweened(0, {
        duration: 2000,
        easing: cubicOut
    });

    onMount(() => {
        progress.set(percentage);
    });

    $: dashArray = 2 * Math.PI * 45;
    $: dashOffset = dashArray * (1 - $progress / 100);
</script>

<div class="flex flex-col items-center justify-center">
    <div class="relative w-48 h-48">
        <svg class="transform -rotate-90 w-48 h-48">
            <circle
                cx="96"
                cy="96"
                r="70"
                stroke="#e6e6e6"
                stroke-width="10"
                fill="none"
            />
            <circle
                cx="96"
                cy="96"
                r="70"
                stroke={color}
                stroke-width="10"
                fill="none"
                stroke-dasharray={dashArray}
                stroke-dashoffset={dashOffset}
                stroke-linecap="round"
            />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-4xl font-bold">{value}</span>
            <span class=" text-gray-500 mt-2 text-sm">{label}</span>
        </div>
    </div>
</div>