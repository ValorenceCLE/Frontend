<template>
  <div class="relative w-full h-full">
    <!-- Heading positioned above the gauge -->
    <h1 v-if="title" class="absolute top-0 left-0 w-full text-center" :style="titleStyle">
      {{ title }}
    </h1>

    <!-- Gauge Chart -->
    <v-chart
      :option="chartOption"
      autoresize
      class="absolute top-0 left-0 w-full h-full"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import configUtils from '@/utils/configUtils';

/**
 * PROPS:
 *  - title: (String) A DOM heading displayed above the gauge
 *  - min, max: (Number) The range of the gauge
 *  - unit: (String) e.g. "°C"
 *  - value: (Number) The current gauge reading
 *  - scale: (Number) A factor for dynamic sizing of arcs/fonts
 */
const props = defineProps({
  title: { type: String, default: "" },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 60 },
  unit: { type: String, default: "°C" },
  value: { type: Number, default: 20 },
  scale: { type: Number, default: 1 },
});

/**
 * Style for the heading
 */
const titleStyle = computed(() => {
  const fontSize = Math.round(22 * props.scale);
  return {
    fontSize: `${fontSize}px`,
    fontWeight: "bolder",
    color: "#333",
    textAlign: "center",
  };
});

/**
 * Function to determine the color of the gauge arc
 * Uses the configuration color stops
 */
function getArcColor(fraction) {
  if (fraction < 0) fraction = 0;
  if (fraction > 1) fraction = 1;

  // Get color stops from configuration
  const colorStops = configUtils.get('charts.gauge.colorStops', [
    [0, '#2a980c'],    // Green at 0%
    [0.5, '#FFDF00'],  // Yellow at 50%
    [1, '#eb191a']     // Red at 100%
  ]);
  
  // Find the right color stops
  for (let i = 1; i < colorStops.length; i++) {
    const prevStop = colorStops[i-1][0];
    const nextStop = colorStops[i][0];
    
    if (fraction >= prevStop && fraction <= nextStop) {
      const startColor = colorStops[i-1][1];
      const endColor = colorStops[i][1];
      const localFraction = (fraction - prevStop) / (nextStop - prevStop);
      return blendColor(startColor, endColor, localFraction);
    }
  }
  
  // Fallback to the last color
  return colorStops[colorStops.length - 1][1];
}

/**
 * Blends two colors based on a fraction
 */
function blendColor(startColor, endColor, t) {
  const s = startColor.replace("#", "");
  const e = endColor.replace("#", "");

  const sr = parseInt(s.substring(0, 2), 16);
  const sg = parseInt(s.substring(2, 4), 16);
  const sb = parseInt(s.substring(4, 6), 16);

  const er = parseInt(e.substring(0, 2), 16);
  const eg = parseInt(e.substring(2, 4), 16);
  const eb = parseInt(e.substring(4, 6), 16);

  const rr = Math.round(sr + (er - sr) * t).toString(16).padStart(2, "0");
  const rg = Math.round(sg + (eg - sg) * t).toString(16).padStart(2, "0");
  const rb = Math.round(sb + (eb - sb) * t).toString(16).padStart(2, "0");

  return `#${rr}${rg}${rb}`;
}

/**
 * ECharts gauge configuration
 */
const chartOption = computed(() => {
  const s = props.scale;
  const range = props.max - props.min;
  const fraction = range ? (props.value - props.min) / range : 0;
  const progressColor = getArcColor(fraction);

  // Apply gauge settings from configuration
  const gaugeWidth = configUtils.get('charts.gauge.arcWidth', 28) * s;
  const tickLength = configUtils.get('charts.gauge.tickLength', 5) * s;
  const splitLineLength = configUtils.get('charts.gauge.splitLineLength', 10) * s;

  return {
    backgroundColor: "transparent",
    series: [
      {
        type: "gauge",
        startAngle: 190,
        endAngle: -10,
        center: ["50%", "80%"],
        radius: `${100 * s}%`,
        min: props.min,
        max: props.max,
        splitNumber: 6,

        axisLine: {
          lineStyle: {
            width: gaugeWidth,
            color: [[1, "#fcfcfc"]],
          },
        },

        progress: {
          show: true,
          width: gaugeWidth,
          itemStyle: {
            color: progressColor,
          },
        },

        axisTick: {
          show: true,
          distance: -gaugeWidth,
          splitNumber: 5,
          length: -tickLength,
          lineStyle: {
            width: 2 * s,
            color: "#909294",
          },
        },

        splitLine: {
          show: true,
          distance: -gaugeWidth,
          length: -splitLineLength,
          lineStyle: {
            width: 2 * s,
            color: "#909294",
          },
        },

        axisLabel: {
          show: false,
        },

        pointer: { show: false },
        anchor: { show: false },

        detail: {
          show: true,
          valueAnimation: true,
          offsetCenter: [0, "-10%"],
          fontSize: Math.round(26 * s),
          fontWeight: "bolder",
          color: "#212529",
          formatter: (val) => `${val} ${props.unit}`,
        },

        data: [{ value: props.value }],
      },
    ],
  };
});
</script>

<style scoped></style>