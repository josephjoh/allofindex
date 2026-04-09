<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950">
    <AppHeader />

    <main class="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
