import { ref } from 'vue';

// Global toast state
const toasts = ref([]);
let toastIdCounter = 0;

export function useToast() {
  /**
   * แสดง toast notification
   * @param {string} type - ประเภท: 'success', 'error', 'warning', 'info'
   * @param {string} title - หัวข้อ
   * @param {string} message - ข้อความรายละเอียด
   * @param {number} duration - ระยะเวลาแสดง (ms), 0 = ไม่ปิดอัตโนมัติ
   */
  const showToast = (type, title, message = '', duration = 4000) => {
    const id = `toast-${++toastIdCounter}`;

    toasts.value.push({
      id,
      type,
      title,
      message,
      duration,
      show: true
    });

    // จำกัดจำนวน toast ไม่เกิน 5 อัน
    if (toasts.value.length > 5) {
      toasts.value.shift();
    }

    return id;
  };

  /**
   * ปิด toast ตาม ID
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * แสดง success toast
   */
  const success = (title, message = '', duration = 4000) => {
    return showToast('success', title, message, duration);
  };

  /**
   * แสดง error toast
   */
  const error = (title, message = '', duration = 4000) => {
    return showToast('error', title, message, duration);
  };

  /**
   * แสดง warning toast
   */
  const warning = (title, message = '', duration = 4000) => {
    return showToast('warning', title, message, duration);
  };

  /**
   * แสดง info toast
   */
  const info = (title, message = '', duration = 4000) => {
    return showToast('info', title, message, duration);
  };

  /**
   * ล้าง toast ทั้งหมด
   */
  const clearAll = () => {
    toasts.value = [];
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll
  };
}
