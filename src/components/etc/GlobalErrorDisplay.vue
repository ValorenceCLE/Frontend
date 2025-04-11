<!-- src/components/etc/GlobalErrorDisplay.vue -->
<template>
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <transition-group name="fade">
            <div
                v-for="error in visibleErrors"
                :key="error.id"
                class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md max-w-md"
                :class="{ 'bg-blue-100 border-blue-400 text-blue-700': error.message.includes('restored') }"
            >
                <span>{{ error.message }}</span>
                <button 
                    @click="dismiss(error.id)" 
                    class="absolute top-1 right-1 text-gray-600 hover:text-gray-800"
                >
                    ×
                </button>
            </div>
        </transition-group>
        
        <!-- Offline indicator -->
        <div
            v-if="isOffline"
            class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative shadow-md max-w-md"
        >
            <span>Working offline. Waiting for connection...</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { errorService } from '@/services/errorService';

const visibleErrors = computed(() => 
    errorService.errors.value.filter(err => !err.dismissed)
);

const isOffline = computed(() => errorService.isOffline.value);

const dismiss = (id) => {
    errorService.dismissError(id);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>