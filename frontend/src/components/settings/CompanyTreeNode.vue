<template>
  <div class="company-tree-node">
    <!-- Company Node -->
    <div class="company-item" @click="toggleExpand">
      <!-- Expand/Collapse Button -->
      <button class="expand-btn" :class="{ 'expanded': isExpanded }">
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Company Icon (สีแดง) -->
      <div class="company-icon">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <!-- Company Info -->
      <div class="company-info">
        <div class="company-name">{{ company.IC_LocalName }}</div>
        <div class="company-code">{{ company.IC_Code }} ({{ company.IC_EnglishName || 'N/A' }})</div>
      </div>

      <!-- Actions (ถ้ามี) -->
      <div class="company-actions">
        <button class="action-btn action-view" title="ดู">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Department Tree (Children) -->
    <div v-if="isExpanded" class="departments-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <svg class="animate-spin h-6 w-6 text-[#0090D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="ml-2 text-sm text-gray-600">กำลังโหลด...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!departmentTree || departmentTree.length === 0" class="empty-state">
        <svg class="w-12 h-12 text-gray-300 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-sm text-gray-500">ยังไม่มีแผนก</p>
        <button
          @click.stop="$emit('add-department', company)"
          class="mt-2 text-sm text-[#0090D3] hover:underline"
        >
          + เพิ่มแผนกใหม่
        </button>
      </div>

      <!-- Department Tree -->
      <DepartmentTree
        v-else
        :treeData="departmentTree"
        @add-child="handleAddChild"
        @view="handleView"
        @edit="handleEdit"
        @move="handleMove"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DepartmentTree from './DepartmentTree.vue';
import { departmentsAPI } from '@/services/api';

const props = defineProps({
  company: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-child', 'view', 'edit', 'move', 'delete', 'add-department']);

const isExpanded = ref(false); // ปิดไว้ตั้งแต่เริ่มต้น ให้ผู้ใช้กดเปิดเอง
const loading = ref(false);
const departmentTree = ref([]);

// Toggle Expand/Collapse
const toggleExpand = async () => {
  isExpanded.value = !isExpanded.value;

  // ถ้าเปิดครั้งแรก และยังไม่มีข้อมูล → fetch
  if (isExpanded.value && departmentTree.value.length === 0) {
    await fetchDepartments();
  }
};

// Fetch Department Tree สำหรับบริษัทนี้
const fetchDepartments = async () => {
  loading.value = true;
  try {
    const response = await departmentsAPI.getTree(props.company.IC_ID);
    departmentTree.value = response.data.data || [];
    console.log(`✅ Loaded ${departmentTree.value.length} departments for ${props.company.IC_Code}`);
  } catch (error) {
    console.error('Error fetching departments:', error);
    departmentTree.value = [];
  } finally {
    loading.value = false;
  }
};

// ไม่ Auto-fetch เมื่อ mount เพราะ default = collapsed ให้ผู้ใช้กดเปิดเอง

// Event Handlers - เพิ่ม company context ก่อน emit ขึ้นไป
const handleAddChild = (node) => {
  emit('add-child', { node, company: props.company });
};

const handleView = (node) => {
  emit('view', { node, company: props.company });
};

const handleEdit = (node) => {
  emit('edit', { node, company: props.company });
};

const handleMove = (node) => {
  emit('move', { node, company: props.company });
};

const handleDelete = (node) => {
  emit('delete', { node, company: props.company });
};
</script>

<style scoped>
.company-tree-node {
  width: 100%;
  margin-bottom: 16px;
}

.company-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.company-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #fafafa;
}

/* Expand Button */
.expand-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.expand-btn svg {
  transition: transform 0.2s ease;
}

.expand-btn.expanded svg {
  transform: rotate(90deg);
}

.expand-btn:hover {
  color: #dc2626;
}

/* Company Icon */
.company-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
  background: #dc2626;
  color: white;
}

/* Company Info */
.company-info {
  flex: 1;
  min-width: 0;
}

.company-name {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  font-family: 'Prompt', sans-serif;
  margin-bottom: 4px;
}

.company-code {
  font-size: 14px;
  color: #6b7280;
  font-family: 'Prompt', sans-serif;
}

/* Actions */
.company-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn.action-view:hover {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Departments Container */
.departments-container {
  margin-top: 12px;
  padding-left: 24px;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
}
</style>
