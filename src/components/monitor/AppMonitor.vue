<template>
    <div class="flex flex-col items-center justify-center w-full h-full">
        <!-- Header -->
        <div class="w-full max-w-lg p-2 bg-gray-200 border border-gray-500 rounded-md shadow-md">
            <h1 class="text-Header text-textColor text-center py-1">Application Monitoring</h1>
        </div>

        <!-- Tabs Navigation -->
        <div class="w-full max-w-4xl my-2 flex bg-gray-200 rounded border border-gray-500 shadow overflow-hidden">
            <div class="border-b border-gray-400 w-full">
                <nav class="flex">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        class="px-4 py-2 text-Subheader font-medium"
                        :class="[
                            activeTab === tab.id 
                                ? 'bg-white border-b-2 border-primaryMed text-primaryMed' 
                                : 'text-textColor hover:bg-gray-100'
                        ]"
                    >
                        {{ tab.name }}
                        <span
                            v-if="tab.id === 'errors' && errorCount > 0"
                            class="ml-2 bg-relayStatusred text-white rounded-full px-2 py-0.5 text-xs"
                        >
                            {{ errorCount }}
                        </span>
                    </button>
                    <button @click="addTestData" class="ml-auto px-4 py-2 text-textColor hover:bg-gray-100">
                        Add Test Data
                    </button>
                </nav>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="w-full max-w-4xl bg-gray-200 rounded border border-gray-500 p-4">
            <!-- Errors Tab -->
            <div v-if="activeTab === 'errors'">
                <div v-if="errors.length === 0" class="text-center py-6 text-gray-500">
                    No errors recorded. That's good news!
                </div>
                <div
                    v-for="(error, index) in errors"
                    :key="index"
                    class="mb-3 bg-red-50 border border-relayStatusred rounded-md p-3"
                >
                    <div class="flex justify-between">
                        <div class="font-semibold text-relayStatusred">{{ error.type || 'Error' }}</div>
                        <div class="text-sm text-gray-500">{{ formatDate(error.timestamp) }}</div>
                    </div>
                    <div class="mt-1 text-textColor">{{ error.message }}</div>
                    <pre v-if="error.stack" class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">{{ error.stack }}</pre>
                </div>
            </div>

            <!-- Performance Tab -->
            <div v-if="activeTab === 'performance'">
                <div class="bg-white border border-gray-300 rounded-md p-4 mb-4">
                    <div class="flex justify-between items-center">
                        <h3 class="font-semibold text-Subheader text-textColor">Debug Information</h3>
                        <button @click="forceRefresh" class="px-3 py-1 bg-primaryMed text-white rounded">
                            Refresh Data
                        </button>
                    </div>
                    <div class="mt-2">
                        <p>Performance API available: {{ typeof window !== 'undefined' && !!window.performance }}</p>
                        <p>Total measures: {{ allMeasures.length }}</p>
                        <p>Total marks: {{ allMarks.length }}</p>
                        <p>Has route measures: {{ hasRouteMeasures }}</p>
                    </div>
                </div>

                <div v-if="allMeasures.length === 0" class="text-center py-6 text-gray-500">
                    No performance data recorded yet. Try clicking "Add Test Data" to generate sample data.
                </div>

                <div v-else class="bg-white border border-gray-300 rounded-md p-4 mb-4">
                    <h3 class="font-semibold text-Subheader text-textColor mb-2">All Performance Measures</h3>
                    <div class="space-y-2">
                        <div
                            v-for="measure in allMeasures"
                            :key="measure.name"
                            class="flex justify-between items-center text-Body"
                        >
                            <span class="text-textColor">{{ measure.name }}</span>
                            <span class="px-2 py-0.5 bg-gray-200 rounded">
                                {{ measure.duration.toFixed(2) }} ms
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="performanceMeasures.length > 0" class="bg-white border border-gray-300 rounded-md p-4">
                    <h3 class="font-semibold text-Subheader text-textColor mb-2">Route Navigation Times</h3>
                    <div class="space-y-2">
                        <div
                            v-for="measure in performanceMeasures"
                            :key="measure.name"
                            class="flex justify-between items-center text-Body"
                        >
                            <span class="text-textColor">{{ formatMeasureName(measure.name) }}</span>
                            <span
                                :class="[
                                    'px-2 py-0.5 rounded',
                                    measure.duration < 300
                                        ? 'bg-relayStatusgreen text-white'
                                        : measure.duration < 1000
                                        ? 'bg-relayStatusyellow text-textColor'
                                        : 'bg-relayStatusred text-white'
                                ]"
                            >
                                {{ measure.duration.toFixed(2) }} ms
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Events Tab -->
            <div v-if="activeTab === 'events'">
                <div v-if="events.length === 0" class="text-center py-6 text-gray-500">
                    No user events recorded yet.
                </div>
                <div v-else class="overflow-x-auto">
                    <table class="min-w-full bg-white border border-gray-300 rounded-md">
                        <thead>
                            <tr class="bg-gray-100 border-b border-gray-300">
                                <th class="px-4 py-2 text-left text-textColor font-semibold">Time</th>
                                <th class="px-4 py-2 text-left text-textColor font-semibold">Category</th>
                                <th class="px-4 py-2 text-left text-textColor font-semibold">Action</th>
                                <th class="px-4 py-2 text-left text-textColor font-semibold">Label</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(event, index) in events" :key="index" class="border-b border-gray-200">
                                <td class="px-4 py-2 text-sm text-gray-500">{{ formatTime(event.timestamp) }}</td>
                                <td class="px-4 py-2 text-sm text-textColor font-medium">{{ event.category }}</td>
                                <td class="px-4 py-2 text-sm text-textColor">{{ event.action }}</td>
                                <td class="px-4 py-2 text-sm text-textColor">{{ event.label }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { monitoringService } from '@/services/monitoringService';

export default {
    name: 'AppMonitor',
    setup() {
        const activeTab = ref('errors');
        const refreshInterval = ref(null);

        const errors = ref([]);
        const performanceData = ref({});
        const events = ref([]);

        const tabs = [
            { id: 'errors', name: 'Errors' },
            { id: 'performance', name: 'Performance' },
            { id: 'events', name: 'User Events' }
        ];

        const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : '';
        const formatTime = (dateString) => dateString ? new Date(dateString).toLocaleTimeString() : '';
        const formatMeasureName = (name) => name.startsWith('route:') ? name.replace('route:', 'Page: ') : name;

        const errorCount = computed(() => errors.value.length);
        const allMeasures = computed(() => performanceData.value?.measures || []);
        const allMarks = computed(() => performanceData.value?.marks || []);
        const hasRouteMeasures = computed(() => allMeasures.value.some(m => m.name.startsWith('route:')));

        const performanceMeasures = computed(() =>
            allMeasures.value
                .filter(m => m.name.startsWith('route:'))
                .map(m => ({
                    name: m.name,
                    duration: m.duration,
                    startTime: m.startTime,
                    endTime: m.startTime + m.duration
                }))
        );

        const refreshData = () => {
            console.log('Refreshing monitoring data');
            errors.value = monitoringService.getErrors();
            performanceData.value = monitoringService.getPerformanceData();
            events.value = monitoringService.getUserEvents();
            console.log('Performance data:', performanceData.value);
        };

        const forceRefresh = () => {
            console.log('Force refreshing data');
            refreshData();
            const testMark = 'test:' + Date.now();
            monitoringService.markPerformance(testMark);
            setTimeout(() => {
                const endMark = testMark + ':end';
                monitoringService.markPerformance(endMark);
                if (typeof window !== 'undefined' && window.performance?.measure) {
                    window.performance.measure('test:measure:' + Date.now(), testMark, endMark);
                } else {
                    console.warn('Performance API not available.');
                }
                refreshData();
            }, 100);
        };

        const addTestData = () => {
            monitoringService.captureError({
                type: 'test',
                message: 'This is a test error',
                stack: 'Error: Test error\n    at addTestData (AppMonitor.vue:123)\n    at Button.onClick (AppMonitor.vue:45)',
                timestamp: new Date().toISOString()
            });

            const startMark = 'test:start';
            const endMark = 'test:end';
            monitoringService.markPerformance(startMark);
            setTimeout(() => {
                monitoringService.markPerformance(endMark);
                monitoringService.markPerformance('route:test');
                monitoringService.markPerformance('route:start:/test');
                monitoringService.markPerformance('route:end:/test');
                if (typeof window !== 'undefined' && window.performance?.measure) {
                    window.performance.measure('route:/test', 'route:start:/test', 'route:end:/test');
                }
                monitoringService.trackEvent('test', 'click', 'Add Test Data', 1);
                refreshData();
            }, 500);
        };

        onMounted(() => {
            if (!monitoringService.isInitialized) {
                monitoringService.init({
                    captureErrors: true,
                    capturePerformance: true,
                    captureUserEvents: true,
                    logLevel: 'debug'
                });
            }
            refreshData();
            refreshInterval.value = setInterval(refreshData, 5000);
        });

        onBeforeUnmount(() => {
            clearInterval(refreshInterval.value);
        });

        return {
            activeTab,
            tabs,
            errors,
            events,
            errorCount,
            performanceMeasures,
            formatDate,
            formatTime,
            formatMeasureName,
            allMeasures,
            allMarks,
            hasRouteMeasures,
            addTestData,
            refreshData,
            forceRefresh
        };
    }
};
</script>
