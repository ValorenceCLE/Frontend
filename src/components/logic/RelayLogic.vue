<!-- src/components/logic/RelayLogic.vue -->
<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Header bar: replicate style from RelaySetup.vue -->
    <div class="w-full py-2 bg-gray-200 border border-gray-500 rounded-md text-center" style="max-width:32rem;">
      <h1 class="text-ModalHeader text-textColor">Custom Logic Management</h1>
      <p class="text-gray-600 text-ModayBody -mb-1">
        Manage your custom conditional logic here.
      </p>
    </div>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryMed"></div>
      <span class="ml-2 text-gray-600">Loading tasks...</span>
    </div>

    <!-- Tasks Table Card -->
    <div v-else-if="conditionalTasks.length" 
         class="bg-gray-200 rounded my-3 border-gray-500 border relative w-full max-w-3xl">
      <ConditionalTasksTable
        :tasks="conditionalTasks"
        :relays="relays"
        @editTask="editTask"
        @deleteTask="deleteTask"
        @openAddTask="openAddTaskModal"
      />
    </div>
    <p v-else class="text-center text-textColor">No conditional logic available.</p>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-3 w-full max-w-3xl">
      {{ successMessage }}
    </div>
    
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-3 w-full max-w-3xl">
      {{ error }}
    </div>

    <!-- Modal -->
    <TaskModal
      v-model="showTaskModal"
      :title="modalTitle"
    >
      <TaskForm
        :initial-task="currentTask"
        :enabled-relays="enabledRelays"
        :field-options="globalFieldMapping"
        @task-submit="handleTaskSubmit"
        @cancel="closeTaskModal"
      />
    </TaskModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useConfig } from '@/composables/useConfig';
import ConditionalTasksTable from "./ConditionalTasksTable.vue";
import TaskModal from "./TaskModal.vue";
import TaskForm from "./TaskForm.vue";

// Use the config composable
const { 
  configData, 
  isLoading, 
  error, 
  successMessage,
  updateConfig
} = useConfig();

// Local state for tasks and modal
const currentTask = ref(null);
const modalTitle = ref("Add Conditional Logic");
const showTaskModal = ref(false);

// Field mapping for logic options
const globalFieldMapping = {
  environmental: ["temperature", "humidity"],
  main: ["volts", "watts", "amps"],
};

// Get relays from the config
const relays = computed(() => {
  return configData.value?.relays || {};
});

// Get tasks from the config
const conditionalTasks = computed(() => {
  return configData.value?.tasks || [];
});

// Get enabled relays for the form
const enabledRelays = computed(() => {
  return Object.values(relays.value).filter((r) => r.enabled);
});

// UUID generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Open modal to add a new task
function openAddTaskModal() {
  currentTask.value = {
    name: "",
    source: "",
    field: "",
    operator: "",
    value: null,
    actions: [],
  };
  modalTitle.value = "Add Conditional Task";
  showTaskModal.value = true;
}

// Open modal to edit an existing task
function editTask(task) {
  if (!task.id) {
    console.error("Task ID not found for editing.");
    return;
  }
  currentTask.value = { ...task };
  modalTitle.value = "Edit Custom Logic";
  showTaskModal.value = true;
}

// Close the task modal
function closeTaskModal() {
  showTaskModal.value = false;
}

// Handle task submission
async function handleTaskSubmit(task) {
  try {
    // Create a copy of the current configuration
    const updatedConfig = { ...configData.value };
    
    // Initialize tasks array if it doesn't exist
    if (!updatedConfig.tasks) {
      updatedConfig.tasks = [];
    }
    
    if (currentTask.value && currentTask.value.id !== undefined) {
      // Update existing task
      const index = updatedConfig.tasks.findIndex(t => t.id === currentTask.value.id);
      if (index !== -1) {
        updatedConfig.tasks[index] = { ...task, id: currentTask.value.id };
      }
    } else {
      // New task - generate a UUID
      const taskWithId = { ...task, id: generateUUID() };
      updatedConfig.tasks.push(taskWithId);
    }
    
    // Update the full configuration
    await updateConfig(updatedConfig);
    
    // Close the modal
    closeTaskModal();
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

// Delete a task
async function deleteTask(taskId) {
  try {
    // Create a copy of the current configuration
    const updatedConfig = { ...configData.value };
    
    // Filter out the task with the given ID
    updatedConfig.tasks = updatedConfig.tasks.filter(task => task.id !== taskId);
    
    // Update the configuration
    await updateConfig(updatedConfig);
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}
</script>