<script lang="ts">
    export let label: string;
    export let placeholder: string;
    export let icon: string;
    export let required: boolean = false;
    export let value: string = "";
    export let rows: number = 3;
</script>

<div class="w-full">
    <label for="textarea-field" class="block text-sm font-medium text-gray-700 mb-1">
        <span id="textarea-label">{label} {#if required}<span class="text-red-500">*</span>{/if}</span>
    </label>
    <div class="relative">
        <span class="material-icons-sharp absolute left-3 top-4 text-gray-400">{icon}</span>
        <textarea 
            {placeholder}
            bind:value
            {required}
            {rows}
            class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 resize-none"
        ></textarea>
    </div>
</div>