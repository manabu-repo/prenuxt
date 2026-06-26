<template>
  <div class="slide-animation text-red">CSS Slide Animation</div>
</template>


<style lang="scss" scoped>
.slide-animation {
  @apply relative overflow-hidden;

  &::before {
    content: '';
    position: absolute;
    left: -100%;
    width: 20%;
    height: 100%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transform: rotate(110deg);
    animation: slide 5s infinite;
  }
}

@keyframes slide {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}
</style>
