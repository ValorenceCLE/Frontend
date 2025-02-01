<template>
  <div ref="chartContainer" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";

let chartInstance = null;
const chartContainer = ref(null);

// Generate large dataset
let base = +new Date(1988, 9, 3);
const oneDay = 24 * 3600 * 1000;
const data = [[base, Math.random() * 300]];
for (let i = 1; i < 20000; i++) {
  const now = new Date((base += oneDay));
  data.push([
    +now, // x: timestamp
    Math.round((Math.random() - 0.5) * 20 + data[i - 1][1]),
  ]);
}

// ECharts option
function getChartOption() {
  return {
    title: {
      text: "Large Area Chart",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      position: function (pt) {
        return [pt[0], "10%"];
      },
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "100%"],
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 20,
      },
      {
        start: 0,
        end: 20,
      },
    ],
    series: [
      {
        name: "Fake Data",
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: {},
        data: data,
      },
    ],
  };
}

onMounted(() => {
  nextTick(() => {
    if (!chartContainer.value) return;
    chartInstance = echarts.init(chartContainer.value);
    chartInstance.setOption(getChartOption());
    window.addEventListener("resize", resizeChart, { passive: true });
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart);
  chartInstance?.dispose();
  chartInstance = null;
});

function resizeChart() {
  chartInstance?.resize();
}
</script>
