<script setup lang="ts">
import { defineProps } from "vue";

const {
  tempMonth,
  tempYear,
  selectedDate,
  daysInMonth,
  currentYear,
  currentMonth,
  isDateDisabled,
  selectDay,
} = defineProps<{
  tempMonth: number | null;
  tempYear: number | null;
  daysInMonth: number;
  selectedDate: Date | null;
  currentYear: number;
  currentMonth: number;
  isDateDisabled: (y: number, m: number, d: number) => boolean;
  selectDay: (d: number) => void;
}>();
</script>

<template>
  <div class="grid grid-cols-7 gap-1 mb-1.5">
    <button
      v-for="day in daysInMonth"
      :key="day"
      @click="selectDay(day)"
      :disabled="
        isDateDisabled(
          tempYear !== null ? tempYear : currentYear,
          tempMonth !== null ? tempMonth : currentMonth,
          day
        )
      "
      :class="[
        'h-7 w-7 flex items-center justify-center border rounded text-xs font-medium',
        selectedDate &&
        selectedDate.getFullYear() ===
          (tempYear !== null ? tempYear : currentYear) &&
        selectedDate.getMonth() ===
          (tempMonth !== null ? tempMonth : currentMonth) &&
        selectedDate.getDate() === day
          ? 'bg-blue-500 text-white border-blue-500'
          : isDateDisabled(
              tempYear !== null ? tempYear : currentYear,
              tempMonth !== null ? tempMonth : currentMonth,
              day
            )
          ? 'bg-gray-50/50 text-gray-400/70 border-gray-200/50 cursor-not-allowed opacity-50'
          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
      ]"
    >
      {{ day }}
    </button>
  </div>
</template>
