// Gauge.vue
<template>
  <div class="gauge-container">
    <canvas ref="canvas" style="width: 100%; height: 100%;"></canvas>
  </div>
</template>

<script>
import { Chart, ArcElement, Tooltip, Title, DoughnutController } from "chart.js";

// Register required components
Chart.register(ArcElement, Tooltip, Title, DoughnutController);

export default {
  name: "Gauge",
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      chart: null, // Holds the chart instance
    };
  },
  mounted() {
    this.createChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  watch: {
    value: {
      handler(newValue) {
        this.updateValue(newValue);
      },
      immediate: true, // Ensure the watcher triggers on initialization
    },
  },
  methods: {
    createChart() {
      const ctx = this.$refs.canvas.getContext("2d");

      // Custom plugin for drawing labels
      const customLabelsPlugin = {
        id: "customLabels",
        beforeDraw(chart) {
          const { width } = chart;
          const ctx = chart.ctx;
          const { top, bottom, left, right } = chart.chartArea;

          // Draw title
          ctx.save();
          ctx.font = "bold 18px Arial";
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(
            chart.options.plugins.customLabels.title,
            width / 2,
            top - 20
          );
          ctx.restore();

          // Draw central value
          const centralValue =
            chart.data.datasets[0].data[0] + chart.options.plugins.customLabels.min;
          ctx.save();
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            `${centralValue}°F`,
            width / 2,
            top + (bottom - top) / 2 - 25
          );
          ctx.restore();

          // Draw min label
          ctx.save();
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.fillText(
            chart.options.plugins.customLabels.min,
            left + 10,
            bottom + 5
          );
          ctx.restore();

          // Draw max label
          ctx.save();
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.fillText(
            chart.options.plugins.customLabels.max,
            right - 10,
            bottom + 5
          );
          ctx.restore();
        },
      };

      // Register the custom plugin
      Chart.register(customLabelsPlugin);

      // Create the chart instance
      this.chart = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [this.value - this.min, this.max - this.value],
              backgroundColor: ["#4caf50", "#e0e0e0"],
              borderWidth: 0,
              circumference: 180,
              rotation: -90,
              cutout: "65%",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
            customLabels: {
              title: this.title,
              min: this.min,
              max: this.max,
            },
          },
          animation: {
            duration: 800, // Duration of animations in milliseconds
            easing: "easeOutElastic", // Changed easing for smoother animations
          },
          layout: {
            padding: 20,
          },
          elements: {
            arc: {
              borderWidth: 0,
              hoverOffset: 4, // Added hover offset for better responsiveness
            },
          },
        },
      });
    },
    updateValue(newValue) {
      if (!this.chart) return;

      const dataset = this.chart.data.datasets[0];
      const newData = [newValue - this.min, this.max - newValue];

      // Update dataset values directly without replacing the array
      dataset.data = newData.slice(); // Clone array to trigger reactivity

      // Trigger a full chart update to ensure rendering
      this.chart.update("active");
    },
  },
};
</script>

<style scoped>
.gauge-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
