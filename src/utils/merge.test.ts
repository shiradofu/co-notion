import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { merge } from "./merge";

describe("utils/merge", () => {
  const cases = {
    addNewFeature: [
      { featA: { isEnabled: true } },
      { featA: { isEnabled: false }, featB: { isEnabled: false } },
      { featA: { isEnabled: true }, featB: { isEnabled: false } },
    ],
    removeFeature: [
      { featA: { isEnabled: false }, featB: { isEnabled: false } },
      { featA: { isEnabled: false } },
      { featA: { isEnabled: false } },
    ],
    propertyTypeChanged: [
      { featA: { isEnabled: true, type: "will be changed" } },
      { featA: { isEnabled: false, type: ["changed"] } },
      { featA: { isEnabled: true, type: ["changed"] } },
    ],
    arrayIsNotOverwritten: [
      { featA: { isEnabled: true, arr: ["remains", "if", "type", "changed"] } },
      { featA: { isEnabled: false, arr: [false] } },
      { featA: { isEnabled: true, arr: ["remains", "if", "type", "changed"] } },
    ],
    RealWorldLikeUsecase: [
      {
        featA: { isEnabled: true },
        featB: {
          isEnabled: true,
          keymaps: ["ctrl+a"],
          deep: { deep: true },
        },
        featC: { isEnabled: false, targets: ["a"], name: "foo" },
      },
      {
        featA: { isEnabled: false },
        featB: {
          isEnabled: false,
          keymaps: {
            caseA: "",
            caseB: "",
          },
          deep: { deep: { deeper: false } },
        },
        featC: { isEnabled: false, targets: [], name: "" },
      },
      {
        featA: { isEnabled: true },
        featB: {
          isEnabled: true,
          keymaps: {
            caseA: "",
            caseB: "",
          },
          deep: { deep: { deeper: false } },
        },
        featC: { isEnabled: false, targets: ["a"], name: "foo" },
      },
    ],
  };

  for (const [name, [target, base, expected]] of Object.entries(cases)) {
    test(name, () => {
      merge(target, base);
      assert.deepStrictEqual(expected, target);
    });
  }
});
