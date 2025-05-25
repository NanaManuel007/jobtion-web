<script lang="ts">
    export let searchTerm: string;
</script>

<div class="w-150 h-13 bg-[rgba(132,139,200,0.18)]  px-3 rounded-full flex justify-end items-center transition-all duration-200">
    <input 
        type="search" 
        bind:value={searchTerm}
        placeholder="Search Data..." 
        class="w-full px-2 bg-transparent border-none outline-none"
    >
    <img src="/images/search.png" alt="search" class="w-5 h-5">
</div>