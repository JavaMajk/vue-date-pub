<script setup lang="ts">
import { defineProps } from "vue";

const {
  tempMonth,
  selectedDate,
  months,
  activeQuarterMonths,
  currentYear,
  isMonthDisabled,
  selectMonth,
} = defineProps<{
  tempMonth: number | null;
  selectedDate: Date | null;
  months: string[];
  activeQuarterMonths: number[];
  currentYear: number;
  isMonthDisabled: (y: number, i: number) => boolean;
  selectMonth: (y: number, i: number) => void;
}>();
</script>

<template>
  <div class="grid grid-cols-4 gap-1 mb-1.5">
    <button
      v-for="(month, index) in months"
      :key="month"
      @click="selectMonth(currentYear, index)"
      :disabled="isMonthDisabled(currentYear, index)"
      :class="[
        'h-7 flex items-center justify-center border rounded text-xs font-medium',
        isMonthDisabled(currentYear, index)
          ? 'bg-gray-50/50 text-gray-400/70 border-gray-200/50 cursor-not-allowed opacity-50'
          : tempMonth === index ||
            (tempMonth === null &&
              selectedDate &&
              selectedDate.getMonth() === index)
          ? 'bg-blue-500 text-white border-blue-500'
          : activeQuarterMonths.includes(index)
          ? 'bg-blue-50'
          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
      ]"
    >
      {{ month.slice(0, 3) }}
    </button>
  </div>
</template>
