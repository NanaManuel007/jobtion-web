<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
    
    type Company = {
        id: number;
        name: string;
        logo: string;
    };
    const defaultCompanies: Company[] = [
        { id: 1, name: 'Acme Corp', logo: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Globex Inc', logo: 'https://via.placeholder.com/40' },
        { id: 3, name: 'Stark Industries', logo: 'https://via.placeholder.com/40' },
        { id: 4, name: 'Wayne Enterprises', logo: 'https://via.placeholder.com/40' }
    ];
    export let companies:Company[] = defaultCompanies;
    export let selectedCompany:Company|null = null;
    
    let isOpen = false;
    let focusedIndex = -1;
    const dispatch = createEventDispatcher();

    function toggleDropdown() {
        isOpen = !isOpen;
        focusedIndex = -1;
    }

    function selectCompany(company: Company) {
        selectedCompany = company;
        isOpen = false;
        focusedIndex = -1;
        dispatch('change', company);
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (!isOpen) return;
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                focusedIndex = Math.min(focusedIndex + 1, companies.length - 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                focusedIndex = Math.max(focusedIndex - 1, 0);
                break;
            case 'Enter':
                if (focusedIndex >= 0) {
                    e.preventDefault();
                    selectCompany(companies[focusedIndex]);
                }
                break;
            case 'Tab':
                if (!e.shiftKey && focusedIndex < companies.length - 1) {
                    e.preventDefault();
                    focusedIndex++;
                }
                break;
            case 'Escape':
                e.preventDefault();
                isOpen = false;
                break;
        }
    }
</script>

<div class="relative">
    <button 
        class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 
        text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-gray-500"
        on:click={toggleDropdown}
        on:keydown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
    >
        {#if selectedCompany}
            <img src={selectedCompany.logo} alt={selectedCompany.name} class="w-6 h-6 rounded-full" />
            <span>{selectedCompany.name}</span>
        {:else}
            <span>Select Company</span>
        {/if}
        <span class="material-icons-sharp text-gray-400 text-sm">
            {isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        </span>
    </button>
    
    {#if isOpen}
    <div 
        class="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-10"
        in:fade={{ duration: 150 }}
        on:click|stopPropagation
        on:keydown={handleKeyDown}
        tabindex="0"
        role="listbox"
        aria-activedescendant={focusedIndex >= 0 ? `company-${focusedIndex}` : undefined}
    >
        <ul class="py-1 max-h-60 overflow-auto">
            {#each companies as company, index}
                <li>
                    <button
                        id={`company-${index}`}
                        class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 
                        {selectedCompany?.id === company.id ? 'bg-gray-100' : ''}
                        {focusedIndex === index ? 'ring-2 ring-blue-500' : ''}"
                        on:click|stopPropagation={() => selectCompany(company)}
                        on:mouseenter={() => focusedIndex = index}
                        role="option"
                        aria-selected={selectedCompany?.id === company.id}
                    >
                        <img src={company.logo} alt={company.name} class="w-6 h-6 rounded-full mr-3" />
                        {company.name}
                    </button>
                </li>
            {/each}
        </ul>
    </div>
{/if}
</div>
<svelte:window 
    on:click={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.relative')) {
            isOpen = false;
        }
    }} 
/>