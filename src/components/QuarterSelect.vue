<script setup lang="ts">
import { defineProps } from "vue";

type Quarter = {
  label: string;
  months: number[];
  year: number;
};

const { tempMonth, selectedDate, months, isQuarterDisabled, selectQuarter } =
  defineProps<{
    tempMonth: number | null;
    selectedDate: Date | null;
    months: string[];
    quarters: Quarter[];
    isQuarterDisabled: (quarter: Quarter) => boolean;
    selectQuarter: (quarter: Quarter) => void;
  }>();

const isQuarterSelected = (quarter: Quarter): boolean => {
  if (!selectedDate) return false;

  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();

  return (
    quarter.months.includes(selectedMonth) && quarter.year === selectedYear
  );
};
</script>

<template>
  <div class="grid grid-cols-4 gap-1 mb-2">
    <button
      v-for="quarter in quarters"
      :key="quarter.label"
      @click="selectQuarter(quarter)"
      :disabled="isQuarterDisabled(quarter)"
      :class="[
        'h-10 px-1 flex flex-col items-center justify-center border rounded text-xs font-medium transition-all duration-200',
        isQuarterDisabled(quarter)
          ? 'bg-gray-50/50 text-gray-400/70 border-gray-200/50 cursor-not-allowed opacity-50'
          : isQuarterSelected(quarter) ||
            (tempMonth !== null && quarter.months.includes(tempMonth))
          ? 'bg-blue-500 text-white border-blue-500 shadow-md'
          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300',
      ]"
    >
      <span class="text-base font-semibold leading-none">{{
        quarter.label
      }}</span>
      <span class="text-[10px] mt-0.5 opacity-80">
        {{ months[quarter.months[0]].slice(0, 3) }} -
        {{ months[quarter.months[2]].slice(0, 3) }}
      </span>
    </button>
  </div>
</template>
