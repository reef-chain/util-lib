import { describe, it, expect } from "vitest";
import {
  isDataSet,
  getData,
  getProgress,
} from "../../src/utils/dataWithProgress";

describe("isDataSet", () => {
  it("should return true if the input is a dataset", () => {
    expect(isDataSet({ data: [1, 2, 3], status: "loaded" })).toBe(true);
  });

  it("should return false if the input is a progress", () => {
    expect(isDataSet("loading")).toBe(false);
  });
});

describe("getData", () => {
  it("should return the data if the input is a dataset", () => {
    expect(getData({ data: [1, 2, 3], status: "loaded" })).toEqual([1, 2, 3]);
  });

  it("should return undefined if the input is a progress", () => {
    expect(getData("loading")).toBeUndefined();
  });
});

describe("getProgress", () => {
  it("should return the progress value if the input is a progress", () => {
    expect(getProgress("loading")).toBe("loading");
  });

  it("should return undefined if the input is a dataset", () => {
    expect(getProgress({ data: [1, 2, 3], status: "loaded" })).toBeUndefined();
  });
});
