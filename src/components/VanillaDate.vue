<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import TimeRangeControls from "./TimeRangeControls.vue";

interface Props {
  modelValue?: Date | null;
  showTime?: boolean;
  timeFormat?: "hours" | "minutes";
  showQuarterly?: boolean;
  showWeekly?: boolean;
  min?: Date | null;
  max?: Date | null;
}

const props = withDefaults(defineProps<Props>(), {
  showTime: false,
  timeFormat: "hours",
  showQuarterly: false,
  showWeekly: false,
  min: null,
  max: null,
});

const emit = defineEmits(["update:modelValue", "open"]);

const selectedDate = ref(props.modelValue || null);
const showPicker = ref(false);
const selectedTimeUnit = ref(props.timeFormat);
const directMinuteInput = ref("");
const directTimeInput = ref("");

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = computed(
  () => selectedDate.value?.getFullYear() ?? new Date().getFullYear()
);
const currentMonth = computed(() => selectedDate.value?.getMonth() ?? 0);
const currentDay = computed(() => selectedDate.value?.getDate() ?? 1);
const currentHours = computed(() => selectedDate.value?.getHours() ?? 0);
const currentMinutes = computed(() => selectedDate.value?.getMinutes() ?? 0);

const quarters = computed(() => [
  { label: "Q1", months: [0, 1, 2], year: currentYear.value },
  { label: "Q2", months: [3, 4, 5], year: currentYear.value },
  { label: "Q3", months: [6, 7, 8], year: currentYear.value },
  { label: "Q4", months: [9, 10, 11], year: currentYear.value },
]);

const daysInMonth = computed(() => {
  const month = tempMonth.value !== null ? tempMonth.value : currentMonth.value;
  return new Date(currentYear.value, month + 1, 0).getDate();
});

const timeUnits = [
  { value: "hours", label: "Hours" },
  { value: "minutes", label: "Minutes" },
];

const isDateDisabled = (year: number, month: number, day: number): boolean => {
  // Default to 00:00 for comparison
  let hours = 0,
    minutes = 0;

  // If this day matches min date, always enable the button (let time picker handle time constraint)
  if (props.min) {
    const min = props.min;
    if (
      year === min.getFullYear() &&
      month === min.getMonth() &&
      day === min.getDate()
    ) {
      return false;
    }
  }
  // If this day matches max date, use max date's time
  if (props.max) {
    const max = props.max;
    if (
      year === max.getFullYear() &&
      month === max.getMonth() &&
      day === max.getDate()
    ) {
      hours = max.getHours();
      minutes = max.getMinutes();
    }
  }

  const date = new Date(year, month, day, hours, minutes);

  if (props.min) {
    if (date < props.min) return true;
  }
  if (props.max) {
    if (date > props.max) return true;
  }
  return false;
};

const isTimeDisabled = (hours: number, minutes: number): boolean => {
  if (!selectedDate.value) return false;

  const date = new Date(selectedDate.value);
  date.setHours(hours, minutes, 0);

  // If there's a min date, check if the time is before it
  if (props.min) {
    const minDate = new Date(props.min);
    if (date < minDate) return true;
  }

  // If there's a max date, check if the time is after it
  if (props.max) {
    const maxDate = new Date(props.max);
    if (date > maxDate) return true;
  }

  return false;
};

const updateDate = (
  year?: number,
  month?: number,
  day?: number,
  hours?: number,
  minutes?: number
) => {
  const newDate = selectedDate.value
    ? new Date(selectedDate.value)
    : new Date();
  if (year !== undefined) newDate.setFullYear(year);
  if (month !== undefined) newDate.setMonth(month);
  if (day !== undefined) newDate.setDate(day);
  if (hours !== undefined) newDate.setHours(hours);
  if (minutes !== undefined) newDate.setMinutes(minutes);

  // Check if the new date is within bounds
  if (props.min && newDate < props.min) return;
  if (props.max && newDate > props.max) return;

  selectedDate.value = newDate;
  emit("update:modelValue", newDate);
};

const selectQuarter = (quarter: (typeof quarters.value)[0]) => {
  tempYear.value = quarter.year;
  tempMonth.value = quarter.months[0];
  selectedDate.value = null; // Clear any selected date
};

const formatDate = computed(() => {
  if (!selectedDate.value) return "Select a date";

  const date = selectedDate.value;
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;

  if (props.showTime) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    switch (selectedTimeUnit.value) {
      case "hours":
        return `${formattedDate} ${hours}:${minutes}`;
      case "minutes":
        return `${formattedDate} ${hours}:${minutes}`;
      default:
        return formattedDate;
    }
  }
  return formattedDate;
});

// Add a watcher to sync with external model value changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedDate.value = newValue || null;
  },
  { immediate: true }
);

const datePickerRef = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (
    datePickerRef.value &&
    !datePickerRef.value.contains(event.target as Node)
  ) {
    showPicker.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Add a new function to check if a quarter is disabled
const isQuarterDisabled = (quarter: (typeof quarters.value)[0]): boolean => {
  if (props.min) {
    const minYear = props.min.getFullYear();
    const minMonth = props.min.getMonth();

    // If quarter's year is before min year, disable
    if (quarter.year < minYear) return true;
    // If same year but quarter's last month is before min month, disable
    if (quarter.year === minYear && quarter.months[2] < minMonth) return true;
  }

  if (props.max) {
    const maxYear = props.max.getFullYear();
    const maxMonth = props.max.getMonth();

    // If quarter's year is after max year, disable
    if (quarter.year > maxYear) return true;
    // If same year but quarter's first month is after max month, disable
    if (quarter.year === maxYear && quarter.months[0] > maxMonth) return true;
  }

  return false;
};

// Add a new function to check if a month is disabled
const isMonthDisabled = (year: number, month: number): boolean => {
  if (props.min) {
    const minYear = props.min.getFullYear();
    const minMonth = props.min.getMonth();

    // If year is less than min year, disable
    if (year < minYear) return true;
    // If same year but month is less than min month, disable
    if (year === minYear && month < minMonth) return true;
  }

  if (props.max) {
    const maxYear = props.max.getFullYear();
    const maxMonth = props.max.getMonth();

    // If year is greater than max year, disable
    if (year > maxYear) return true;
    // If same year but month is greater than max month, disable
    if (year === maxYear && month > maxMonth) return true;
  }

  return false;
};

// Add computed property for total minutes
const totalMinutes = computed(() => {
  if (!selectedDate.value) return 0;
  return selectedDate.value.getHours() * 60 + selectedDate.value.getMinutes();
});

// Add updateTime method
const updateTime = (hours: number, minutes: number) => {
  if (!selectedDate.value) return;
  const newDate = new Date(selectedDate.value);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  // Check if the new date is within bounds
  if (props.min && newDate < props.min) return;
  if (props.max && newDate > props.max) return;
  selectedDate.value = newDate;
  emit("update:modelValue", newDate);
};

// Update handleTimeInput to use updateTime
const handleTimeInput = (value: string) => {
  const minutes = parseInt(value);
  if (isNaN(minutes) || minutes < 0 || minutes > 1439) return;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  updateTime(hours, remainingMinutes);
};

// Watch for time unit changes to reset direct input
watch(selectedTimeUnit, () => {
  directTimeInput.value = "";
  directMinuteInput.value = "";
});

const clearDate = () => {
  selectedDate.value = null;
  emit("update:modelValue", null);
  showPicker.value = false;
};

// Update selectMonth to only update internal state for month, not selectedDate
const tempMonth = ref<number | null>(null);
const tempYear = ref<number | null>(null);

const selectMonth = (year: number, month: number) => {
  tempYear.value = year;
  tempMonth.value = month;
  selectedDate.value = null; // Clear any selected date
};

// Update day selection to use tempYear and tempMonth if set
const selectDay = (day: number) => {
  const year = tempYear.value !== null ? tempYear.value : currentYear.value;
  const month = tempMonth.value !== null ? tempMonth.value : currentMonth.value;
  // If the selected day matches the min date, set time to min's hours and minutes
  if (
    props.min &&
    year === props.min.getFullYear() &&
    month === props.min.getMonth() &&
    day === props.min.getDate()
  ) {
    updateTime(props.min.getHours(), props.min.getMinutes() + 1);
    directMinuteInput.value = (
      props.min.getHours() * 60 +
      props.min.getMinutes() +
      1
    ).toString();
    updateDate(
      year,
      month,
      day,
      props.min.getHours(),
      props.min.getMinutes() + 1
    );
  } else {
    updateDate(year, month, day);
  }
  tempYear.value = null;
  tempMonth.value = null;
};

// Add a ref for year input as a string
const yearInput = ref(currentYear.value.toString());

// Watch for changes in currentYear to update yearInput as a string
watch(currentYear, (val) => {
  yearInput.value = val.toString();
});

// Function to handle year input change
const handleYearInput = () => {
  let y = parseInt(yearInput.value);
  if (isNaN(y)) y = currentYear.value;
  if (y < 1900) y = 1900;
  if (y > 2100) y = 2100;
  yearInput.value = y.toString();
  updateDate(y);
};

// Add back the computed property for the active quarter's months
const activeQuarterMonths = computed(() => {
  let month = tempMonth.value;
  if (month === null && selectedDate.value) {
    month = selectedDate.value.getMonth();
  }
  if (month !== null) {
    const q = quarters.value.find((q) => q.months.includes(month));
    return q ? q.months : [];
  }
  return [];
});

// Compute weeks for the current year
function getWeeksOfYear(year: number) {
  const weeks = [];
  let date = new Date(year, 0, 1);
  // Move to Monday of the first week
  while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
  let week = 1;
  while (date.getFullYear() === year) {
    weeks.push({
      week,
      start: new Date(date),
    });
    date.setDate(date.getDate() + 7);
    week++;
  }
  return weeks;
}
const weeksOfYear = computed(() => getWeeksOfYear(currentYear.value));

// Week selection logic
const selectWeek = (weekObj: { week: number; start: Date }) => {
  tempYear.value = weekObj.start.getFullYear();
  tempMonth.value = weekObj.start.getMonth();
  selectedDate.value = new Date(weekObj.start);
};

// Add a ref for the selected week
const selectedWeek = computed(() => {
  if (!selectedDate.value) return "";
  const weekNum = getWeekOfYear(selectedDate.value);
  const year = selectedDate.value.getFullYear();
  return `${year}-W${weekNum}`;
});

const handleWeekDropdown = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  const [year, weekStr] = value.split("-W");
  const week = parseInt(weekStr);
  const yearNum = parseInt(year);
  const weekObj = weeksOfYear.value.find(
    (w) => w.week === week && w.start.getFullYear() === yearNum
  );
  if (weekObj) selectWeek(weekObj);
};

function getWeekOfYear(date: Date) {
  const temp = new Date(date.getFullYear(), 0, 1);
  // Move to Monday
  while (temp.getDay() !== 1) temp.setDate(temp.getDate() + 1);
  let week = 1;
  while (temp < date) {
    temp.setDate(temp.getDate() + 7);
    if (temp <= date) week++;
  }
  return week;
}

// Add computed for min allowed minutes for the selected day
const minAllowedMinutes = computed(() => {
  if (!props.min) return 0;
  if (!selectedDate.value) return 0;
  const min = props.min;
  if (
    selectedDate.value.getFullYear() === min.getFullYear() &&
    selectedDate.value.getMonth() === min.getMonth() &&
    selectedDate.value.getDate() === min.getDate()
  ) {
    return min.getHours() * 60 + min.getMinutes();
  }
  return 0;
});

// Update maxAllowedMinutes to be dynamic based on max prop and selected day
const maxAllowedMinutes = computed(() => {
  if (!props.max) return 1439;
  if (!selectedDate.value) return 1439;
  const max = props.max;
  if (
    selectedDate.value.getFullYear() === max.getFullYear() &&
    selectedDate.value.getMonth() === max.getMonth() &&
    selectedDate.value.getDate() === max.getDate()
  ) {
    return max.getHours() * 60 + max.getMinutes();
  }
  return 1439;
});

const directMinuteInputError = computed(() => {
  if (!directMinuteInput.value) return "";
  const minutes = parseInt(directMinuteInput.value);
  if (isNaN(minutes)) return "";
  if (minutes < minAllowedMinutes.value) {
    return `Minimum allowed: ${minAllowedMinutes.value} minutes for this day.`;
  }
  if (minutes > maxAllowedMinutes.value) {
    return `Maximum allowed: ${maxAllowedMinutes.value} minutes for this day.`;
  }
  return "";
});
</script>

<template>
  <div class="relative w-[280px] font-sans" ref="datePickerRef">
    <div
      class="px-2.5 py-1.5 border border-gray-300 rounded cursor-pointer bg-white text-sm text-gray-800 flex items-center justify-between"
      @click.stop="showPicker = !showPicker"
    >
      <span>{{ formatDate }}</span>
      <button
        v-if="selectedDate"
        @click.stop="clearDate"
        title="Clear date"
        class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded bg-gray-50 text-gray-800 text-xs font-medium hover:bg-gray-100 hover:border-gray-300 disabled:bg-gray-50/50 disabled:text-gray-400/70 disabled:border-gray-200/50 disabled:cursor-not-allowed disabled:hover:bg-gray-50/50 disabled:hover:border-gray-200/50 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-gray-500 hover:text-gray-700"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="showPicker"
      class="absolute top-full left-0 w-full bg-white border border-gray-300 rounded p-2 mt-1 z-50"
    >
      <!-- Year Selection -->
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

      <!-- Quarterly Selection -->
      <div v-if="showQuarterly" class="grid grid-cols-4 gap-1 mb-2">
        <button
          v-for="quarter in quarters"
          :key="quarter.label"
          @click="selectQuarter(quarter)"
          :disabled="isQuarterDisabled(quarter)"
          :class="[
            'h-10 px-1 flex flex-col items-center justify-center border rounded text-xs font-medium transition-all duration-200',
            isQuarterDisabled(quarter)
              ? 'bg-gray-50/50 text-gray-400/70 border-gray-200/50 cursor-not-allowed opacity-50'
              : (
                  tempMonth !== null
                    ? quarter.months.includes(tempMonth)
                    : selectedDate &&
                      quarter.months.includes(selectedDate.getMonth())
                )
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
      <div v-if="showQuarterly" class="border-t border-gray-200 my-2"></div>

      <!-- Weekly Selection -->
      <div v-if="showWeekly" class="mb-2">
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

      <!-- Month Selection -->
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
      <div class="border-t border-gray-200 my-2"></div>

      <!-- Day Selection -->
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
      <div class="border-t border-gray-200 my-2"></div>

      <!-- Time Selection -->
      <div
        v-if="showTime"
        class="flex flex-col gap-2 border-t border-gray-200 pt-2 mt-2"
      >
        <div class="flex gap-1 mb-1.5">
          <select
            v-model="selectedTimeUnit"
            class="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 disabled:bg-gray-50/50 disabled:text-gray-400/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option
              v-for="unit in timeUnits"
              :key="unit.value"
              :value="unit.value"
            >
              {{ unit.label }}
            </option>
          </select>
        </div>

        <div
          v-if="selectedTimeUnit === 'minutes'"
          class="flex flex-col gap-1.5"
        >
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model="directMinuteInput"
              @input="(e) => handleTimeInput((e.target as HTMLInputElement).value)"
              :class="[
                'w-full px-2 py-1 text-sm border rounded bg-gray-50 text-gray-800 focus:outline-none',
                directMinuteInputError
                  ? 'border-red-500'
                  : 'border-gray-200 focus:border-blue-500',
              ]"
              min="0"
              :placeholder="`Enter minutes (${minAllowedMinutes}–${maxAllowedMinutes})`"
            />
          </div>
          <div v-if="directMinuteInputError" class="text-xs text-red-500 mt-0">
            {{ directMinuteInputError }}
          </div>
          <div class="text-xs text-gray-500 text-center">
            Current: {{ totalMinutes }} minutes ({{
              currentHours.toString().padStart(2, "0")
            }}:{{ currentMinutes.toString().padStart(2, "0") }})
          </div>
        </div>

        <TimeRangeControls
          v-if="selectedTimeUnit === 'hours'"
          :current-hours="currentHours"
          :current-minutes="currentMinutes"
          :is-time-disabled="isTimeDisabled"
          :update-time="updateTime"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* No custom CSS needed - all styles are handled by Tailwind */
</style>
