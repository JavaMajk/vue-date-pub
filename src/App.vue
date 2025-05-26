<script setup lang="ts">
import VanillaDate from "./components/VanillaDate.vue";
import { ref, computed, watch } from "vue";

const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);

// Computed property to ensure end date is not before start date
const minEndDate = computed(() => startDate.value || null);

// Watch for changes in start date
watch(
  () => startDate.value,
  () => {
    endDate.value = null;
  },
  { deep: true, immediate: true }
);

// Format date for server
const dateToPostToServer = (date: Date | null) => {
  if (!date) return null;
  return {
    date: date.toISOString().split("T")[0],
    time: date.toTimeString().split(" ")[0],
    timestamp: date.getTime(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  };
};

// Computed values for display in UI
const startDateDisplay = computed(() => dateToPostToServer(startDate.value));
const endDateDisplay = computed(() => dateToPostToServer(endDate.value));

const showWeekly = ref(false);
const showTime = ref(true);
const showQuarterly = ref(true);
</script>

<template>
  <div
    class="flex gap-4 p-4 bg-gray-50 border-b border-gray-200 m-4 rounded-lg"
  >
    <div class="flex flex-col gap-2">
      <label class="font-medium text-gray-700">Vanilla-Date Options</label>

      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="showQuarterly" />
        Show Quarterly
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="showWeekly" />
        Show Weekly
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="showTime" />
        Show Time
      </label>
    </div>
  </div>

  <div class="flex gap-8 p-4 h-screen align-center justify-center">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-gray-700">Start Date</label>
      <VanillaDate
        v-model="startDate"
        :show-weekly="showWeekly"
        :show-time="showTime"
        :show-quarterly="showQuarterly"
        time-format="hours"
        :max="endDate"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-gray-700">End Date</label>
      <VanillaDate
        v-model="endDate"
        :show-weekly="showWeekly"
        :show-time="showTime"
        :show-quarterly="showQuarterly"
        time-format="hours"
        :min="minEndDate"
      />
    </div>

    <div class="flex flex-col gap-2 min-w-[300px]">
      <label class="text-sm font-medium text-gray-700">Selected Values</label>
      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <pre class="text-xs font-mono text-gray-700 whitespace-pre-wrap">{{
          {
            startDate: startDateDisplay,
            endDate: endDateDisplay,
          }
        }}</pre>
      </div>
    </div>
  </div>
</template>
