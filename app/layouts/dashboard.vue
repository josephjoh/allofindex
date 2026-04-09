<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <AppHeader />
    <main class="flex-1 px-4 py-6 max-w-7xl w-full mx-auto">
      <slot />
    </main>
  </div>
</template>
