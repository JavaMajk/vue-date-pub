<script setup lang="ts">
import { defineProps, ref, watch, toRef } from "vue";

const { currentYear, currentMonth, currentDay, isDateDisabled, updateDate } =
  defineProps<{
    currentYear: number;
    currentMonth: number;
    currentDay: number;
    isDateDisabled: (y: number, m: number, d: number) => boolean;
    updateDate: (y: number) => void;
  }>();

const yearInput = ref(currentYear.toString());
const yearRef = toRef(() => currentYear);
watch(yearRef, (val) => {
  yearInput.value = val.toString();
});

// Function to handle year input change
const handleYearInput = () => {
  let y = parseInt(yearInput.value);
  if (isNaN(y)) y = currentYear;
  if (y < 1900) y = 1900;
  if (y > 2100) y = 2100;
  yearInput.value = y.toString();
  updateDate(y);
};
</script>

<template>
  <div class="flex gap-1 mb-1.5 justify-start items-center">
    <button
      @click="updateDate(currentYear - 1)"
      :disabled="isDateDisabled(currentYear - 1, currentMonth, currentDay)"
      class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-50/50 disabled:text-gray-400/70 disabled:border-gray-200/50 disabled:cursor-not-allowed disabled:hover:bg-gray-50/50 disabled:hover:border-gray-200/50 disabled:opacity-50"
    >
      ◀
    </button>
    <input
      v-model="yearInput"
      @keyup.enter="handleYearInput"
      @blur="handleYearInput"
      class="w-16 text-center text-sm font-medium text-gray-800 border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white px-1 py-0.5"
      min="1900"
      max="2100"
    />
    <button
      @click="updateDate(currentYear + 1)"
      :disabled="isDateDisabled(currentYear + 1, currentMonth, currentDay)"
      class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-50/50 disabled:text-gray-400/70 disabled:border-gray-200/50 disabled:cursor-not-allowed disabled:hover:bg-gray-50/50 disabled:hover:border-gray-200/50 disabled:opacity-50"
    >
      ▶
    </button>
  </div>
</template>
