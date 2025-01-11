<template>
  <div class="gauge-container">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { Chart, ArcElement, Tooltip, Title, DoughnutController } from "chart.js";

// Register required components
Chart.register(ArcElement, Tooltip, Title, DoughnutController);

export default {
  name: "Gauge",
  props: {
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
  mounted() {
    const ctx = this.$refs.canvas.getContext("2d");

    // Custom plugin for drawing labels
    const customLabelsPlugin = {
      id: "customLabels",
      beforeDraw(chart) {
        const { width } = chart;
        const ctx = chart.ctx;
        const { top, bottom, left, right } = chart.chartArea;

        // Draw central value
        ctx.save();
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#333"; // Match general text color
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${chart.data.datasets[0].data[0]}°`,
          width / 2,
          top + (bottom - top) / 1 - 20 // Adjusted to move away from the gauge
        );
        ctx.restore();

        // Draw min label
        ctx.save();
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText(
          `${chart.options.plugins.customLabels.min}`,
          left + 10, // Position directly under the left edge of the gauge
          bottom + 5 // Close to the bottom edge
        );
        ctx.restore();

        // Draw max label
        ctx.save();
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText(
          `${chart.options.plugins.customLabels.max}`,
          right - 10, // Position directly under the right edge of the gauge
          bottom + 5 // Close to the bottom edge
        );
        ctx.restore();
      },
    };

    // Register the custom plugin
    Chart.register(customLabelsPlugin);

    // Create a custom gauge using Chart.js
    new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [this.value - this.min, this.max - this.value],
            backgroundColor: ["#4caf50", "#e0e0e0"],
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
            cutout: "70%", // Inner cutout size for the gauge
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
            min: this.min,
            max: this.max,
          },
        },
        layout: {
          padding: 20,
        },
        elements: {
          arc: {
            borderWidth: 0, // No border for the arcs
          },
        },
      },
    });
  },
};
</script>

<style scoped>
.gauge-container {
  width: 100%;
  height: 100%;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
