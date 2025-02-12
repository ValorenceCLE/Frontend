<template>
    <transition name="fade">
        <div
            v-if="show"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            @click.self="closeModal"
        >
            <div
                class="bg-white rounded-md shadow-md w-full max-w-xl relative border border-gray-500"
                @click.stop
            >
                <!-- HEADER -->
                <div class="border-b border-gray-500 relative">
                    <!-- Close Icon -->
                    <img
                        :src="xIcon"
                        alt="Close"
                        class="w-6 h-6 cursor-pointer hover:scale-105 transition-transform absolute top-1 right-1"
                        @click="closeModal"
                    />

                    <!-- Page Title -->
                    <h2 class="text-center text-ModalHeader italic text-textColor">
                        {{ currentPageTitle }}
                    </h2>
                    <p class="text-ModalInfo text-textColor italic transition-transform absolute top-2 left-3">
                        {{ editedRelay.name || 'Relay' }}
                    </p>

                    <!-- Subheader -->
                    <p class="text-center text-ModalSubheader text-textColor italic p-0.5">
                        {{ currentPageSubheader }}
                    </p>
                </div>

                <!-- MAIN CONTENT -->
                <div>
                    <!-- Settings Page -->
                    <SettingsModal
                        v-if="currentPage === 'settings'"
                        :relay="editedRelay"
                        :relayKey="relayKey"
                        @fields-updated="handleRelayFields"
                    />
                    <!-- Dashboard Page -->
                    <DashboardModal
                        v-else-if="currentPage === 'dashboard'"
                        :dashboard="editedRelay.dashboard"
                        @dashboard-updated="handleDashboardFields"
                    />
                </div>

                <!-- FOOTER -->
                <div class="border-t border-gray-500">
                    
                    <div class="flex items-center justify-center -space-x-1">
                        <img
                            :src="chevronLeft"
                            alt="Previous Page"
                            class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                            @click="prevPage"
                        />
                        <div class="flex items-center space-x-0.5">
                            <span
                                class="text-xl cursor-pointer transition-colors"
                                style="transform: translateY(-1px)"
                                :class="currentPage === 'settings' ? 'text-textColor' : 'text-gray-400 hover:text-gray-600'"
                                @click="switchPage('settings')"
                            >
                                •
                            </span>
                            <span
                                class="text-xl cursor-pointer transition-colors"
                                style="transform: translateY(-1px)"
                                :class="currentPage === 'dashboard' ? 'text-textColor' : 'text-gray-400 hover:text-gray-600'"
                                @click="switchPage('dashboard')"
                            >
                                •
                            </span>
                        </div>
                        <img
                            :src="chevronRight"
                            alt="Next Page"
                            class="w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
                            @click="nextPage"
                        />
                    </div>
                    <div class="flex justify-center space-x-1 text-ModalButton p-0.5" style="transform: translateY(-3px)">
                        <button
                            class="bg-primaryMed hover:bg-primaryLight text-white rounded-md w-20 flex items-center justify-center"
                            @click="saveChanges"
                        >
                            <span style="transform: translateY(-1px)">Save</span>
                        </button>
                        <button
                            class="bg-blue-500 hover:bg-blue-600 text-white rounded-md w-20 flex items-center justify-center"
                            @click="preview"
                        >
                            <span style="transform: translateY(-1px)">View</span>
                        </button>
                        <button
                            class="bg-grayDark hover:bg-gray-700 text-white rounded-md w-20 flex items-center justify-center"
                            @click="closeModal"
                        >
                            <span style="transform: translateY(-1px)">Cancel</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import SettingsModal from "./SettingsModal.vue";
import DashboardModal from "./DashboardModal.vue";
import xIcon from "@/assets/icons/x.svg";
import chevronLeft from "@/assets/icons/chevron-left.svg";
import chevronRight from "@/assets/icons/chevron-right.svg";

export default {
    name: "EditModal",
    components: {
        SettingsModal,
        DashboardModal,
    },
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
            xIcon,
            chevronLeft,
            chevronRight,
            editedRelay: {},
            currentPage: "settings", // "settings" or "dashboard"
        };
    },
    computed: {
        currentPageTitle() {
            return this.currentPage === "settings" ? "Relay Setup" : "Dashboard Setup";
        },
        currentPageSubheader() {
            return this.currentPage === "settings"
                ? "Modify the behavior of the relay in the system"
                : "Modify the appearance of the relay on the dashboard";
        },
    },
    watch: {
        relay: {
            immediate: true,
            handler(newRelay) {
                this.editedRelay = { ...newRelay };
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
        prevPage() {
            if (this.currentPage === "dashboard") {
                this.currentPage = "settings";
            }
        },
        nextPage() {
            if (this.currentPage === "settings") {
                this.currentPage = "dashboard";
            }
        },
        handleRelayFields(updatedFields) {
            this.editedRelay = { ...this.editedRelay, ...updatedFields };
        },
        handleDashboardFields(updatedDash) {
            this.editedRelay.dashboard = { ...updatedDash };
        },
        preview() {
            console.log("Preview Relay:", this.editedRelay);
        },
        saveChanges() {
            const updatedRelay = { ...this.editedRelay };
            this.$emit("update-relay", { relayKey: this.relayKey, updatedRelay });
            this.$emit("updated");
            this.closeModal();
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
