<template>
  <div class="department-node" :style="{ paddingLeft: `${level * 24}px` }">
    <!-- Node Item -->
    <div class="node-item">
      <!-- Expand/Collapse Button -->
      <button
        v-if="hasChildren"
        @click="toggleExpand"
        class="expand-btn"
        :class="{ 'expanded': isExpanded }"
      >
        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div v-else class="expand-btn-placeholder"></div>

      <!-- Type Icon (ใช้ node.ID_Type จริง) -->
      <div class="type-icon" :class="getIconClass()">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>

      <!-- Node Info -->
      <div class="node-info">
        <div class="node-header">
          <span class="node-name">{{ node.ID_LocalName }}</span>
        </div>
        <div class="node-subtitle">
          <span class="node-type">{{ getDisplayType() }}</span>
          <span class="node-code">({{ node.ID_Code }})</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="node-actions">
        <button @click="$emit('view', node)" class="action-btn action-view" title="ดู">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button @click="$emit('edit', node)" class="action-btn action-edit" title="แก้ไข">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          v-if="canAddChild"
          @click="$emit('add-child', node)"
          class="action-btn action-add"
          title="เพิ่มหน่วยงานย่อย"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button @click="$emit('delete', node)" class="action-btn action-delete" title="ลบ">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Children (Recursive) -->
    <div v-if="hasChildren && isExpanded" class="children">
      <DepartmentTreeNode
        v-for="(child, index) in node.children"
        :key="child.ID_ID"
        :node="child"
        :level="level + 1"
        :index="index"
        @add-child="$emit('add-child', $event)"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @move="$emit('move', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  index: {
    type: Number,
    default: 0
  }
});

defineEmits(['add-child', 'view', 'edit', 'move', 'delete']);

// Expand/Collapse State
const isExpanded = ref(true); // เปิดทุก node โดย default

// Check if node has children
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

// Toggle Expand/Collapse
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// Type Mapping (ใช้ node.ID_Type จริง)
const typeConfig = {
  'branch': { label: 'สาขา', color: 'type-blue' },
  'office': { label: 'สำนัก', color: 'type-green' },
  'department': { label: 'ฝ่าย', color: 'type-orange' }
};

// กำหนดสี Icon ตาม node.ID_Type
const getIconClass = () => {
  const type = props.node.ID_Type || 'department'; // default = department
  return typeConfig[type]?.color || 'type-orange';
};

// แสดงชื่อประเภทตาม node.ID_Type
const getDisplayType = () => {
  const type = props.node.ID_Type || 'department';
  return typeConfig[type]?.label || 'ฝ่าย';
};

// Check ว่าสามารถเพิ่มลูกได้ไหม
// branch → สามารถเพิ่ม office/department
// office → สามารถเพิ่ม department
// department → ไม่สามารถเพิ่มลูก
const canAddChild = computed(() => {
  const type = props.node.ID_Type;
  return type === 'branch' || type === 'office';
});
</script>

<style scoped>
.department-node {
  width: 100%;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.node-item:hover {
  background: #f9fafb;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Expand Button */
.expand-btn {
  width: 20px;
  height: 20px;
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
  color: #0090D3;
}

.expand-btn-placeholder {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Type Icons */
.type-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  flex-shrink: 0;
}

.type-icon.type-blue {
  background: #3b82f6;
  color: white;
}

.type-icon.type-green {
  background: #10b981;
  color: white;
}

.type-icon.type-orange {
  background: #f59e0b;
  color: white;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.node-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  font-family: 'Prompt', sans-serif;
}

.node-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-family: 'Prompt', sans-serif;
}

.node-type {
  font-weight: 500;
}

.node-code {
  color: #9ca3af;
}

.node-actions {
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

.action-btn.action-edit:hover {
  background: #f0fdf4;
  border-color: #10b981;
  color: #10b981;
}

.action-btn.action-add:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #f59e0b;
}

.action-btn.action-delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.children {
  margin-top: 6px;
}
</style>
