<template>
  <div class="department-list">
    <!-- Department Items (Flat List) -->
    <div
      v-for="(node, index) in treeData"
      :key="node.ID_ID"
      class="department-item"
    >
      <DepartmentTreeNode
        :node="node"
        :level="0"
        :index="index"
        @add-child="$emit('add-child', $event)"
        @edit="$emit('edit', $event)"
        @move="$emit('move', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <!-- Empty State -->
    <div v-if="!treeData || treeData.length === 0" class="empty-state">
      <svg class="w-16 h-16 text-gray-300 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <p class="text-gray-500 font-prompt">ไม่มีข้อมูลแผนก</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import DepartmentTreeNode from './DepartmentTreeNode.vue';

defineProps({
  treeData: {
    type: Array,
    default: () => []
  }
});

defineEmits(['add-child', 'edit', 'move', 'delete']);
</script>

<style scoped>
.department-list {
  width: 100%;
}

.department-item {
  margin-bottom: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}
</style>
