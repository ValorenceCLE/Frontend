<template>
  <div class="relative w-full h-full">
    <!-- This heading is absolutely positioned, not affecting the gauge's size. -->
    <h1 v-if="title" class="absolute top-0 left-0 w-full text-center" :style="titleStyle">
      {{ title }}
    </h1>

    <!-- The gauge arcs fill the entire container underneath the heading. -->
    <v-chart
      :option="chartOption"
      autoresize
      class="absolute top-0 left-0 w-full h-full"
    />
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { use } from "echarts/core";
import { GaugeChart } from "echarts/charts";
import { TitleComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// Register the required ECharts components
use([TitleComponent, GaugeChart, CanvasRenderer]);

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
 * DOM heading style (unrelated to the arc color).
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
 * Function that returns a color in the green->yellow->red range
 * based on fraction (0=low,1=high).  Adjust as you like for more nuance.
 */
function getArcColor(fraction) {
  // If you want a 2-step approach, do:
  //  fraction < 0.5 => blend green->yellow
  //  fraction >= 0.5 => blend yellow->red
  // or you can do a single linear approach from green->red with a midpoint.

  // For example, let's do 2-step:
  if (fraction < 0) fraction = 0;
  if (fraction > 1) fraction = 1;

  if (fraction < 0.5) {
    // 0..0.5 -> green..yellow
    const subFrac = fraction / 0.5;
    return blendColor("#2a980c", "#FFDF00", subFrac);
  } else {
    // 0.5..1 -> yellow..red
    const subFrac = (fraction - 0.5) / 0.5;
    return blendColor("#FFDF00", "#eb191a", subFrac);
  }
}

/**
 * Utility to blend two hex colors (start->end) by fraction t in [0..1].
 * Simple approach for demonstration.
 */
function blendColor(startColor, endColor, t) {
  // remove '#' if present
  const s = startColor.replace("#", "");
  const e = endColor.replace("#", "");
  // parse as integers
  const sr = parseInt(s.substring(0, 2), 16);
  const sg = parseInt(s.substring(2, 4), 16);
  const sb = parseInt(s.substring(4, 6), 16);
  const er = parseInt(e.substring(0, 2), 16);
  const eg = parseInt(e.substring(2, 4), 16);
  const eb = parseInt(e.substring(4, 6), 16);

  // interpolate each channel
  const rr = Math.round(sr + (er - sr) * t)
    .toString(16)
    .padStart(2, "0");
  const rg = Math.round(sg + (eg - sg) * t)
    .toString(16)
    .padStart(2, "0");
  const rb = Math.round(sb + (eb - sb) * t)
    .toString(16)
    .padStart(2, "0");
  return `#${rr}${rg}${rb}`;
}

/**
 * ECharts gauge config.
 * We keep axisLine a neutral color for the background,
 * and compute a dynamic color for the "progress" arc using 'progress.itemStyle.color'.
 */
const chartOption = computed(() => {
  const s = props.scale;

  // fraction in [0..1] for (props.value - min)/(max - min)
  const range = props.max - props.min;
  const fraction = range ? (props.value - props.min) / range : 0;
  // pick a color for the moving arc
  const progressColor = getArcColor(fraction);

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

        // The "background" (unfilled) portion is #fcfcfc
        axisLine: {
          lineStyle: {
            width: 28 * s,
            color: [[1, "#fcfcfc"]], // Single neutral color for the track
          },
        },

        // "progress" arc is the portion from min up to 'value'.
        // We'll apply a dynamic color to that arc via itemStyle below.
        progress: {
          show: true,
          width: 28 * s,
          // 'itemStyle.color' overrides the arc color for the progress portion only
          itemStyle: {
            color: progressColor, // the dynamic shading
          },
        },

        axisTick: {
          show: true,
          distance: -28 * s,
          splitNumber: 5,
          length: -5 * s,
          lineStyle: {
            width: 2 * s,
            color: "#909294",
          },
        },
        splitLine: {
          show: true,
          distance: -28 * s,
          length: -10 * s,
          lineStyle: {
            width: 2 * s,
            color: "#909294",
          },
        },
        axisLabel: {
          show: false,
          distance: 15 * s,
          color: "#212529",
          fontSize: Math.round(10 * s),
          fontWeight: "500",
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

        // We no longer set 'itemStyle.color' on the overall gauge,
        // because we're applying the color specifically to the progress portion above.
        data: [{ value: props.value }],
      },
    ],
  };
});
</script>

<style scoped></style>
