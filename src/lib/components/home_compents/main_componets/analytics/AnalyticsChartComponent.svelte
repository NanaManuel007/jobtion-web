<script lang="ts">
    import {onMount} from "svelte";
    import Chart from "chart.js/auto";
    const { percentage, color  } = $props<{
        percentage: number;
        color: string;
    }>();
    // export let percentage: number;
    // export let color: string;
    let chartRef: HTMLCanvasElement;
    let chart: Chart;

    $effect(() => {
        if (!chartRef) return;
        
        // Destroy existing chart if it exists
        if (chart) {
            chart.destroy();
        }

        // Create new chart
        chart = new Chart(chartRef, {
            type: "doughnut",
            data: {
                datasets: [
                    {
                        data: [Math.abs(percentage), 100 - Math.abs(percentage)],
                        backgroundColor: [color, "#E5E7EB"]
                    }
                ]
            },
            options: {
                cutout: "80%",
                responsive: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            }
        });
    });

    onMount(() => {
        return () => {
            if (chart) {
                chart.destroy();
            }
        };
    });
</script>

<div class="relative w-16 h-16">
    <canvas bind:this={chartRef} class="absolute inset-0"></canvas>
    <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-600">
        {percentage}%
    </span>
</div>