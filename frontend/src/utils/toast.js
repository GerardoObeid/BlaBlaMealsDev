import { reactive } from 'vue';

export const toastState = reactive({
  isVisible: false,
  message: '',
  type: 'success', // 'success' or 'error'
  timeoutId: null
});

export const toast = {
  show(message, type = 'success', duration = 3000) {
    // Clear any existing timeout
    if (toastState.timeoutId) {
      clearTimeout(toastState.timeoutId);
    }
    
    toastState.message = message;
    toastState.type = type;
    toastState.isVisible = true;
    
    // Auto hide
    toastState.timeoutId = setTimeout(() => {
      toastState.isVisible = false;
    }, duration);
  },
  
  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  },
  
  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  },
  
  hide() {
    toastState.isVisible = false;
    if (toastState.timeoutId) {
      clearTimeout(toastState.timeoutId);
    }
  }
};
