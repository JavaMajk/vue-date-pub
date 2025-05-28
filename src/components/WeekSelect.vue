<script setup lang="ts">
import { defineProps } from "vue";

const { selectedWeek, handleWeekDropdown, weeksOfYear } = defineProps<{
  selectedWeek: string | null;
  weeksOfYear: Array<{
    week: number;
    start: Date;
    end: Date;
  }>;
  handleWeekDropdown: (event: Event) => void;
}>();
</script>

<template>
  <div class="mb-2">
    <select
      class="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500"
      :value="selectedWeek"
      @change="handleWeekDropdown"
    >
      <option value="" disabled>Select week</option>
      <option
        v-for="week in weeksOfYear"
        :key="week.week"
        :value="`${week.start.getFullYear()}-W${week.week}`"
      >
        Week {{ week.week }} ({{
          week.start.getDate().toString().padStart(2, "0")
        }}.{{ (week.start.getMonth() + 1).toString().padStart(2, "0") }})
      </option>
    </select>
  </div>
</template>
