import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import VanillaDate from "../VanillaDate.vue";

describe("VanillaDate", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(VanillaDate, {
      props: {
        modelValue: new Date("2025-05-26"),
      },
    });
  });

  it("renders properly with default props", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".date_picker_vanilla_wrapper").exists()).toBe(true);
  });

  it("displays formatted date correctly", () => {
    expect(wrapper.text()).toContain("2025-05-26");
  });

  it("opens datepicker on click", async () => {
    const trigger = wrapper.find(".date_pick_vanilla_toggle");
    await trigger.trigger("click");
    expect(wrapper.find(".date_picker_vanilla_dropdown").exists()).toBe(true);
  });

  it("allows month selection", async () => {
    await wrapper.setProps({ modelValue: new Date("2025-05-26") });
    await wrapper.find(".date_pick_vanilla_toggle").trigger("click");

    // Find and click July button
    const monthButtons = wrapper.findAll("button");
    const julyButton = monthButtons.find((button) =>
      button.text().includes("Jul")
    );
    await julyButton?.trigger("click");

    // Verify the month was updated in the internal state
    expect(wrapper.vm.tempMonth).toBe(6); // July is index 6
  });

  it("clears date when clear button is clicked", async () => {
    await wrapper.find(".date_pick_vanilla_toggle").trigger("click");
    const clearButton = wrapper.find('button[title="Clear date"]');
    await clearButton.trigger("click");

    expect(wrapper.emitted()["update:modelValue"][0]).toEqual([null]);
  });

  it("emits update:modelValue when date is selected", async () => {
    await wrapper.find(".date_pick_vanilla_toggle").trigger("click");

    // Select a day
    const dayButtons = wrapper.findAll("button");
    const day15Button = dayButtons.find((button) => button.text() === "15");
    await day15Button?.trigger("click");

    const emitted = wrapper.emitted()["update:modelValue"];
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toBeInstanceOf(Date);
  });

  it("handles time selection when showTime is true", async () => {
    wrapper = mount(VanillaDate, {
      props: {
        modelValue: new Date("2025-05-26"),
        showTime: true,
      },
    });

    await wrapper.find(".date_pick_vanilla_toggle").trigger("click");
    expect(wrapper.find("select").exists()).toBe(true);
  });
});
