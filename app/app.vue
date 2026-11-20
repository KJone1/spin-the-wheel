<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="logo-text">WHEEL DECIDES DESTINY</h1>
    </header>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-header {
  border: var(--border);
  background-color: var(--white);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow);
}

.logo-text {
  font-family: var(--font-heading);
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .logo-text {
    font-size: 2.5rem;
  }
}
</style>
