<script lang="ts">
    export let label: string;
    export let value: string | number = '';
    export let type: 'text' | 'number' | 'tel' | 'email' |'password' = 'text';
    export let placeholder: string = '';
    export let required: boolean = false;
    export let readonly: boolean = false;
    export let icon: string = '';
    export let error: string | undefined = undefined;
    export let min: string | number | undefined = undefined;
    export let max: string | number | undefined = undefined;
    
    // Generate a unique ID for each input field for accessibility
    const inputId = `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Derived class for input styling based on icon and error state
    $: inputClass = `w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-400' : 'focus:ring-gray-400'} focus:border-transparent transition-all duration-200`;

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        if (type === 'number') {
            value = target.value ? Number(target.value) : '';
        } else {
            value = target.value;
        }
    }
</script>

<div class="w-full">
    <label for={inputId} class="block text-sm font-medium text-gray-700 mb-1">
        {label}{required ? ' *' : ''}
    </label>
    <div class="relative">
        {#if icon}
            <span class="material-icons-sharp absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </span>
        {/if}
        <input 
            id={inputId}
            {type}
            {placeholder}
            value={value}
            {readonly}
            {min}
            {max}
            on:input={handleInput}
            class={inputClass}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
        />
    </div>
    {#if error}
        <p id="{inputId}-error" class="mt-1 text-sm text-red-600">{error}</p>
    {/if}
</div>