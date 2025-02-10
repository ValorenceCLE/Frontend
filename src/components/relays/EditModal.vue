<template>
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            @click.self="closeModal"
        >
            <div
                class="bg-white rounded-lg shadow-lg w-full max-w-2xl relative border border-gray-600"
                @click.stop
            >
                <div class="p-4 border-b border-gray-600">
                    <h2 class="text-3xl font-bold text-textColor text-center">
                        {{ editedRelay.name || 'Relay' }}
                    </h2>
                    <p class="text-center text-sm italic text-gray-500">
                        {{ currentPage === 'settings' ? 'Relay Settings' : 'Dashboard Settings' }}
                    </p>
                </div>

                <div class="p-4 text-textColor">
                    <div v-if="currentPage === 'settings'">
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">Relay Name:</label>
                            <input
                                type="text"
                                v-model="editedRelay.name"
                                class="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">Enabled:</label>
                            <select
                                v-model="editedRelay.enabled"
                                class="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option :value="true">True</option>
                                <option :value="false">False</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">Power Up State:</label>
                            <select
                                v-model="editedRelay.boot_state"
                                class="w-full border border-gray-300 rounded-md p-2"
                            >
                                <option value="on">On</option>
                                <option value="off">Off</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">Pulse Time (Seconds):</label>
                            <input
                                type="number"
                                v-model="editedRelay.pulse_time"
                                class="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">On Status Text:</label>
                            <input
                                type="text"
                                v-model="editedRelay.on_status_text"
                                class="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="block mb-1 font-medium">Off Status Text:</label>
                            <input
                                type="text"
                                v-model="editedRelay.off_status_text"
                                class="w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    </div>

                    <div v-else-if="currentPage === 'dashboard'">
                        <div
                            v-for="(section, key) in dashboardSections"
                            :key="key"
                            class="mb-3 border border-gray-300 rounded"
                        >
                            <div
                                class="flex items-center justify-between p-2 bg-gray-100 cursor-pointer"
                                @click="toggleSection(key)"
                            >
                                <span class="font-bold">{{ section.title }}</span>
                                <span class="text-lg">{{ expandedSections[key] ? '▼' : '►' }}</span>
                            </div>
                            <div v-if="expandedSections[key]" class="p-2">
                                <div
                                    v-for="field in section.fields"
                                    :key="field.model"
                                    class="mb-2"
                                >
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        {{ field.label }}
                                    </label>
                                    <input
                                        type="text"
                                        v-model="editedDashboard[key][field.model]"
                                        class="w-full border border-gray-300 rounded-md p-1 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-center mt-2">
                            <button class="bg-secondary hover:bg-secondary-light text-white py-1 px-3 rounded text-sm">
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                <div class="p-4 border-t border-gray-600">
                    <div class="flex justify-center mb-4">
                        <button
                            @click="switchPage('settings')"
                            :class="currentPage === 'settings' ? 'text-primaryMed border-b-2 border-primaryMed' : 'text-gray-500'"
                            class="mx-2 text-sm"
                        >
                            Relay Settings
                        </button>
                        <button
                            @click="switchPage('dashboard')"
                            :class="currentPage === 'dashboard' ? 'text-primaryMed border-b-2 border-primaryMed' : 'text-gray-500'"
                            class="mx-2 text-sm"
                        >
                            Dashboard Settings
                        </button>
                    </div>
                    <div class="flex justify-center space-x-4">
                        <button
                            class="bg-primaryMed hover:bg-primaryLight text-white py-1 px-4 rounded text-sm"
                            @click="saveChanges"
                        >
                            Save
                        </button>
                        <button
                            class="bg-grayDark hover:bg-gray-700 text-white py-1 px-4 rounded text-sm"
                            @click="closeModal"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import DummyAPI from "@/api/dummyApi";

export default {
    name: "EditModal",
    props: {
        show: {
            type: Boolean,
            required: true,
        },
        relay: {
            type: Object,
            required: true,
        },
        relayKey: {
            type: [String, Number],
            required: true,
        },
    },
    data() {
        return {
            editedRelay: {},
            editedDashboard: {},
            currentPage: "settings",
            dashboardSections: {
                on_button: {
                    title: "On Button",
                    fields: [
                        { label: "Status Text:", model: "status_text" },
                        { label: "Status Color:", model: "status_color" },
                        { label: "Button Label:", model: "button_label" },
                    ],
                },
                off_button: {
                    title: "Off Button",
                    fields: [
                        { label: "Status Text:", model: "status_text" },
                        { label: "Status Color:", model: "status_color" },
                        { label: "Button Label:", model: "button_label" },
                    ],
                },
                pulse_button: {
                    title: "Pulse Button",
                    fields: [
                        { label: "Status Text:", model: "status_text" },
                        { label: "Button Label:", model: "button_label" },
                    ],
                },
            },
            expandedSections: {},
        };
    },
    watch: {
        relay: {
            immediate: true,
            handler(newRelay) {
                this.editedRelay = { ...newRelay };
                this.editedDashboard = newRelay.dashboard ? { ...newRelay.dashboard } : {};
                for (const key in this.dashboardSections) {
                    if (!this.editedDashboard[key]) {
                        this.editedDashboard[key] = {
                            status_text: "",
                            status_color: "",
                            button_label: "",
                        };
                    }
                    this.expandedSections[key] = false;
                }
            },
        },
    },
    methods: {
        closeModal() {
            this.$emit("close");
        },
        switchPage(page) {
            this.currentPage = page;
        },
        toggleSection(sectionKey) {
            this.expandedSections[sectionKey] = !this.expandedSections[sectionKey];
        },
        saveChanges() {
            const updatedRelay = {
                ...this.editedRelay,
                dashboard: { ...this.editedDashboard },
            };
            this.$emit("update-relay", {
                relayKey: this.relayKey,
                updatedRelay,
            });
            DummyAPI.post("/api/relaySetup", {
                relayKey: this.relayKey,
                relay: updatedRelay,
            })
                .then(() => {
                    this.$emit("updated");
                    this.closeModal();
                })
                .catch((error) => {
                    console.error("Error saving changes:", error);
                    this.$emit("updated");
                    this.closeModal();
                });
        },
    },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
