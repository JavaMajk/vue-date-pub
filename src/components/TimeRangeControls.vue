<script setup lang="ts">
import { defineProps } from 'vue'

const { currentHours, currentMinutes, isTimeDisabled, updateTime } = defineProps<{
  currentHours: number,
  currentMinutes: number,
  isTimeDisabled: (h: number, m: number) => boolean,
  updateTime: (h: number, m: number) => void,
}>()

const btnClass =
  'w-7 h-7 flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-800 text-xs font-medium ' +
  'hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-50/50 disabled:text-gray-400/70 disabled:border-gray-200/50 ' +
  'disabled:cursor-not-allowed disabled:hover:bg-gray-50/50 disabled:hover:border-gray-200/50 disabled:opacity-50'
</script>

<template>
  <div class="time_ranges flex gap-3 justify-center">
    <div class="flex items-center gap-1.5">
      <button @click="updateTime(currentHours - 1, currentMinutes)"
        :disabled="isTimeDisabled(currentHours - 1, currentMinutes)" :class="btnClass">
        -
      </button>
      <input
        min="0"
        max="23"
        class="w-12 text-center text-sm font-medium text-gray-800 border border-gray-200 rounded"
        :value="currentHours.toString().padStart(2, '0')"
        @input="e => {
          const val = Number((e.target as HTMLInputElement).value);
          if (!isNaN(val) && val >= 0 && val <= 23 && !isTimeDisabled(val, currentMinutes)) {
        updateTime(val, currentMinutes);
          }
        }"
      />
      <button @click="updateTime(currentHours + 1, currentMinutes)"
        :disabled="isTimeDisabled(currentHours + 1, currentMinutes)" :class="btnClass">
        +
      </button>
    </div>
    <div class="flex items-center gap-1.5">
      <button @click="updateTime(currentHours, currentMinutes - 1)"
      :disabled="isTimeDisabled(currentHours, currentMinutes - 1)" :class="btnClass">
      -
      </button>
      <input
      min="0"
      max="59"
      class="w-12 text-center text-sm font-medium text-gray-800 border border-gray-200 rounded"
      :value="currentMinutes.toString().padStart(2, '0')"
      @input="e => {
        const val = Number((e.target as HTMLInputElement).value);
        if (!isNaN(val) && val >= 0 && val <= 59 && !isTimeDisabled(currentHours, val)) {
        updateTime(currentHours, val);
        }
      }"
      />
      <button @click="updateTime(currentHours, currentMinutes + 1)"
      :disabled="isTimeDisabled(currentHours, currentMinutes + 1)" :class="btnClass">
      +
      </button>
    </div>
  </div>
</template>