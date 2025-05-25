<script>
    import SocialIcons from './SocialIcons.svelte';
    export let isActive;
  </script>
  
  <div class="absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 opacity-0 z-1"
       class:translate-x-full={isActive}
       class:opacity-100={isActive}
       class:z-5={isActive}>
    <form class="bg-white flex flex-col items-center justify-center h-full px-10">
      <h1 class="text-2xl font-bold mb-4">Create Account</h1>
      <SocialIcons />
      <span class="text-sm mb-4">or use your email for registration</span>
      <input type="text" placeholder="Name" class="bg-[#eee] border-none my-2 px-4 py-2 text-sm rounded-lg w-full outline-none">
      <input type="email" placeholder="Email" class="bg-[#eee] border-none my-2 px-4 py-2 text-sm rounded-lg w-full outline-none">
      <input type="password" placeholder="Password" class="bg-[#eee] border-none my-2 px-4 py-2 text-sm rounded-lg w-full outline-none">
      <button class="bg-[#512da8] text-white text-sm px-11 py-2.5 border border-transparent rounded-lg font-semibold tracking-wider uppercase mt-2.5 cursor-pointer">
        Sign Up
      </button>
    </form>
  </div>