<template>
  <Transition name="toast-slide">
    <div v-if="state.isVisible" :class="['toast-notification', state.type]">
      <span class="toast-icon">
        <template v-if="state.type === 'success'">✅</template>
        <template v-else>⚠️</template>
      </span>
      <span class="toast-message">{{ state.message }}</span>
      <button class="toast-close" @click="hideToast">&times;</button>
    </div>
  </Transition>
</template>

<script>
import { toastState, toast } from '../utils/toast';

export default {
  name: 'ToastNotification',
  setup() {
    const hideToast = () => toast.hide();
    
    return {
      state: toastState,
      hideToast
    };
  }
}
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 80px; /* Below the navbar */
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: var(--border-radius-md, 8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 9999;
  font-family: var(--font-family, inherit);
  font-size: 0.95rem;
  font-weight: 500;
  min-width: 300px;
}

.toast-notification.success {
  background-color: #f0fdf4;
  color: #166534;
  border-left: 4px solid #22c55e;
}

.toast-notification.error {
  background-color: #fef2f2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  opacity: 1;
}

/* Vue Transition classes */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>
