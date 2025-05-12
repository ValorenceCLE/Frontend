<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <!-- Header bar: replicate style from RelaySetup.vue -->
    <div class="w-full py-2 bg-gray-200 border border-gray-500 rounded-md text-center" style="max-width:32rem;">
      <h1 class="text-ModalHeader text-textColor">Custom Logic Management</h1>
      <p class="text-gray-600 text-ModayBody -mb-1">
        Manage your custom conditional logic logic here.
      </p>
    </div>

    <!-- Tasks Table Card -->
    <div v-if="conditionalTasks.length" 
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

    <!-- Modal -->
    <TaskModal
      v-bind="taskModalProps"
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useConfigStore } from "@/store/config";
import ConditionalTasksTable from "./ConditionalTasksTable.vue";
import TaskModal from "./TaskModal.vue";
import TaskForm from "./TaskForm.vue";
import { useModal } from "@/composables/useModal";

// Get the config store
const configStore = useConfigStore();

// Store for tasks and relays data
const relays = ref({});
const conditionalTasks = ref([]);
const currentTask = ref(null);
const modalTitle = ref("Add Conditional Logic");

// Field mapping for logic options
const globalFieldMapping = {
  environmental: ["temperature", "humidity"],
  main: ["volts", "watts", "amps"],
};

// Use the modal composable
const { 
  isOpen: showTaskModal, 
  open: openTaskModal, 
  close: closeTaskModal, 
  modalProps: taskModalProps 
} = useModal({
  closeOnEscape: true,
  closeOnOutsideClick: false
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

// Fetch data from the config store
async function fetchData() {
  try {
    if (!configStore.configData) {
      await configStore.fetchConfig();
    }
    relays.value = configStore.configData?.relays || {};
    conditionalTasks.value = configStore.configData?.tasks || [];
    
    // Ensure all tasks have an ID
    conditionalTasks.value = conditionalTasks.value.map(task => {
      if (!task.id) {
        return { ...task, id: generateUUID() };
      }
      return task;
    });
  } catch (error) {
    console.error("Error fetching config store data:", error);
  }
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
  openTaskModal();
}

// Open modal to edit an existing task
function editTask(task) {
  if (!task.id) {
    console.error("Task ID not found for editing.");
    return;
  }
  currentTask.value = { ...task };
  modalTitle.value = "Edit Custom Logic";
  openTaskModal();
}

// Handle task submission
async function handleTaskSubmit(task) {
  try {
    if (currentTask.value && currentTask.value.id !== undefined) {
      // Update existing task - find index and replace
      const index = conditionalTasks.value.findIndex(t => t.id === currentTask.value.id);
      if (index !== -1) {
        // Create new array with updated task
        const updatedTasks = [...conditionalTasks.value];
        updatedTasks[index] = { ...task, id: currentTask.value.id };
        conditionalTasks.value = updatedTasks;
      }
    } else {
      // New task - generate a UUID
      const taskWithId = { ...task, id: generateUUID() };
      conditionalTasks.value = [...conditionalTasks.value, taskWithId];
    }
    
    // Update the config store
    configStore.configData.tasks = [...conditionalTasks.value];
    await configStore.updateConfig({ ...configStore.configData });
    
    // Close the modal
    closeTaskModal();
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

// Delete a task
async function deleteTask(taskId) {
  try {
    // Filter out the task with the given ID
    conditionalTasks.value = conditionalTasks.value.filter(task => task.id !== taskId);
    
    // Update the config store
    configStore.configData.tasks = [...conditionalTasks.value];
    await configStore.updateConfig({ ...configStore.configData });
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

// Initialize data on component mount
onMounted(() => {
  fetchData();
});
</script>