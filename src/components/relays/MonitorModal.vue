<template>
    <div class="flex justify-center w-full px-2 py-1">
        <div class="grid grid-cols-2 gap w-full bg-gray-100 border border-gray-500 rounded px-2 py-1">
            
            <!-- Enabled toggle -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor">
                    Enabled:
                </label>
            </div>
            <select
                v-model="localMonitor.enabled"
                class="border border-gray-500 rounded bg-white mb-1.5"
                @change="emitChanges"
            >
                <option :value="true">True</option>
                <option :value="false">False</option>
            </select>

            <!-- Low Threshold Volts -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    Low Threshold Volts:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.low_threshold.volts"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />

            <!-- Low Threshold Watts -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    Low Threshold Watts:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.low_threshold.watts"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />

            <!-- Low Threshold Amps -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    Low Threshold Amps:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.low_threshold.amps"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />

            <!-- High Threshold Volts -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    High Threshold Volts:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.high_threshold.volts"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />

            <!-- High Threshold Watts -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    High Threshold Watts:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.high_threshold.watts"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />

            <!-- High Threshold Amps -->
            <div class="flex items-center justify-start mb-1.5">
                <label class="text-ModalLabel text-textColor flex items-center">
                    High Threshold Amps:
                </label>
            </div>
            <input
                type="number"
                v-model="localMonitor.high_threshold.amps"
                class="border border-gray-500 rounded bg-white px-1 mb-1.5"
                @input="emitChanges"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: "MonitorModal",
    data() {
        return {
            localMonitor: {
                enabled: false,
                low_threshold: {
                    volts: 0,
                    watts: 0,
                    amps: 0,
                },
                high_threshold: {
                    volts: 0,
                    watts: 0,
                    amps: 0,
                },
            },
        };
    },
    methods: {
        emitChanges() {
            this.$emit("fields-updated", { ...this.localMonitor });
        },
    },
};
</script>

<style scoped>
label {
    transform: translateY(0px);
}
input,
select {
    font-size: 0.8rem;
    line-height: 0.8rem;
    font-weight: 500;
    color: #333;
}
option {
    font-size: 0.8rem;
    line-height: 0.8rem;
    font-weight: 500;
    color: #333;
}
input:focus,
select:focus {
    outline: none;
    border-color: rgba(51, 51, 51, 0.5);
    box-shadow: 0 0 0 0.75px rgba(51, 51, 51, 0.5);
}
</style>
