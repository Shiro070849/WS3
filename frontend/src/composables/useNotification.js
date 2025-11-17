import { ref } from 'vue';

// Global notification state
const notification = ref({
  show: false,
  type: 'info', // 'success', 'error', 'warning', 'info'
  title: '',
  message: '',
});

export function useNotification() {
  const showNotification = (type, title, message) => {
    notification.value = {
      show: true,
      type,
      title,
      message,
    };
  };

  const closeNotification = () => {
    notification.value.show = false;
  };

  const success = (message, title = 'สำเร็จ') => {
    showNotification('success', title, message);
  };

  const error = (message, title = 'เกิดข้อผิดพลาด') => {
    showNotification('error', title, message);
  };

  const warning = (message, title = 'คำเตือน') => {
    showNotification('warning', title, message);
  };

  const info = (message, title = 'ข้อมูล') => {
    showNotification('info', title, message);
  };

  return {
    notification,
    showNotification,
    closeNotification,
    success,
    error,
    warning,
    info,
  };
}
