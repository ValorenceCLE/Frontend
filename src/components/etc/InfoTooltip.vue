<template>
  <span
    class="relative inline-flex items-center group"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- Help Icon -->
    <img
      src="@/assets/icons/help-circle.svg"
      alt="Info"
      class="w-4 h-4 ml-1 cursor-pointer inline"
      ref="tooltipIcon"
    />

    <!-- Tooltip -->
    <span
      v-if="visible"
      ref="tooltip"
      class="fixed bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg opacity-0 transition-opacity duration-200 whitespace-nowrap z-50"
      :style="tooltipStyle"
    >
      {{ text }}
    </span>
  </span>
</template>

<script>
export default {
  name: "InfoTooltip",
  props: {
    text: { type: String, required: true },
  },
  data() {
    return {
      visible: false,
      tooltipStyle: {},
    };
  },
  methods: {
    showTooltip() {
      this.visible = true;
      this.$nextTick(() => {
        const icon = this.$refs.tooltipIcon;
        const tooltip = this.$refs.tooltip;

        if (!icon || !tooltip) return;

        const iconRect = icon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = iconRect.top - tooltipRect.height - 8; // Default above icon
        let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;

        // Prevent tooltip from going off screen
        if (top < 0) top = iconRect.bottom + 8; // Move below if no space above
        if (left < 0) left = 8; // Prevent overflow left
        if (left + tooltipRect.width > window.innerWidth)
          left = window.innerWidth - tooltipRect.width - 8; // Prevent overflow right

        this.tooltipStyle = { top: `${top}px`, left: `${left}px`, opacity: 1 };
      });
    },
    hideTooltip() {
      this.visible = false;
    },
  },
};
</script>

<style scoped>
.inline-flex {
  display: inline-flex;
  vertical-align: 5px;
}
</style>
