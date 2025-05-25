<script>
    
    // import { createEventDispatcher } from 'svelte';
    export let isActive;
    // const dispatch = createEventDispatcher();
  </script>
  
  <div class="absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out rounded-l-[150px] z-[1000]"
       class:translate-x-[-100%]={isActive}
       class:rounded-r-[150px]={isActive}
       class:rounded-l-none={isActive}>
    <div class="bg-gradient-to-r from-[#5c6bc0] to-[#512da8] text-white relative left-[-100%] h-full w-[200%] transform transition-all duration-600 ease-in-out"
    style:transform={isActive ? 'translateX(50%)' : 'translateX(0)'}>

      <div class="absolute right-0 w-1/2 h-full flex items-center justify-center flex-col px-8 text-center top-0 transform transition-all duration-600 ease-in-out"
           class:translate-x-[200%]={isActive}>
        <h1 class="text-2xl font-bold">Hello, ADMIN!</h1>
        <p class="text-sm my-5">Let's get go hard today, we got alot to do, login let's go.</p>
        <!-- <button on:click={() => dispatch('toggle')} 
                class="bg-transparent border border-white text-white text-sm px-11 py-2.5 rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer">
          Sign Up
        </button> -->
      </div>
    </div>
  </div>