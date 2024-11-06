import { type FeatureConfig, getDefaultFeatureConfig } from "../config/feature";
import { i } from "../i18n";
import { Log } from "../utils/log";
import { forceMerge } from "../utils/merge";
import { type Obj, getObjValueByCtx } from "../utils/obj";
import { getFromSyncStorage, setToSyncStorage } from "../utils/storage";

type Primitive = boolean | string | number;

class FeatureConfigForm {
  private config: FeatureConfig;
  private readonly TRANSLATION_CTX = "configUI";
  private log = new Log(this.constructor.name);

  constructor() {
    this.config = getDefaultFeatureConfig();
  }

  async init() {
    // Keys of objects stored in chrome.storage are force sorted by alphabetically.
    // Overwriting values of defaultFeatureConfig by storage-stored values to use
    // the order we defined.
    forceMerge(this.config, await getFromSyncStorage("featureConfig"));
    this.render();
  }

  private async render() {
    const form = document.querySelector<HTMLFormElement>(".ConfigForm");
    if (!form) throw new Error("ConfigForm not found");

    const list = form?.querySelector<HTMLUListElement>(".ConfigForm__List");
    if (!list) throw new Error("ConfigForm__List not found");
    this.renderTree(this.config, list, []);

    const submission = form.querySelector<HTMLElement>(
      ".ConfigForm__Submission",
    );
    if (!submission) throw new Error("ConfigForm__Submission not found");
    this.addSubmission(form, submission);
  }

  private renderTree(config: Obj, list: HTMLElement, ctx: string[]) {
    if ("isEnabled" in config && typeof config.isEnabled === "boolean") {
      const li = this.createItem([...ctx, "isEnabled"], config.isEnabled);
      list.appendChild(li);
    }

    for (const k of Object.keys(config)) {
      if (k === "isEnabled") continue;
      const v = config[k];
      if (Array.isArray(v)) continue; // no array config values for now
      if (typeof v === "object" && v) {
        this.renderTree(v as Obj, list, [...ctx, k]);
        continue;
      }
      const li = this.createItem([...ctx, k], v as Primitive);
      list.appendChild(li);
    }
  }

  private addSubmission(form: HTMLElement, submission: HTMLElement) {
    const button = document.createElement("button");
    button.classList.add("ConfigForm__SubmissionButton");
    button.type = "submit";
    button.textContent = i([this.TRANSLATION_CTX, "submit"]);
    submission.appendChild(button);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setToSyncStorage("featureConfig", this.config)
        .then(() => {
          this.renderSubmissionStatus(true, submission);
        })
        .catch((e) => {
          this.renderSubmissionStatus(false, submission);
          this.log.local("addSubmission").err(e);
        });
    });
  }

  private renderSubmissionStatus(isSucceed: boolean, submission: HTMLElement) {
    const i = document.createElement("i");
    i.textContent = isSucceed ? "✓" : "×";
    i.classList.add(
      "ConfigForm__SubmissionStatus",
      `ConfigForm__SubmissionStatus--${isSucceed ? "succeeded" : "failed"}`,
    );
    submission.insertBefore(i, submission.firstChild);
    setTimeout(() => {
      i.remove();
    }, 3000);
  }

  private createItem(ctx: string[], configValue: Primitive) {
    const id = ctx.join(".");

    const depth = ctx.at(-1) === "isEnabled" ? ctx.length - 2 : ctx.length - 1;
    const li = document.createElement("li");
    li.classList.add("ConfigList__Item", `ConfigList__Item--depth${depth}`);

    const label = document.createElement("label");
    label.classList.add("ConfigList__ItemLabel");
    label.htmlFor = id;
    label.textContent = i([this.TRANSLATION_CTX, ...ctx]);
    li.appendChild(label);

    const input = document.createElement("input");
    input.id = id;
    input.type = this.valueTypeToInputType(configValue);
    this.setInputValue(input, configValue);
    input.addEventListener("change", this.onChangeInput);
    li.appendChild(input);

    return li;
  }

  private onChangeInput = ({ currentTarget: input }: Event) => {
    if (!(input instanceof HTMLInputElement)) return;

    const ctx = input.id.split(".");
    const key = ctx.pop();
    const config = getObjValueByCtx<Obj>(this.config, ctx);
    if (!key || !config || !(key in config)) {
      throw new Error(`${ctx.join(".")} not found in featureConfig table`);
    }

    this.setConfigValue(config, key, input);
  };

  private valueTypeToInputType(configValue: Primitive) {
    switch (typeof configValue) {
      case "boolean":
        return "checkbox";
      case "string":
        return "text";
      case "number":
        return "number";
    }
  }

  private setInputValue(input: HTMLInputElement, configValue: Primitive) {
    switch (typeof configValue) {
      case "boolean": {
        input.checked = configValue;
        break;
      }
      case "string": {
        input.value = configValue;
        break;
      }
      case "number": {
        input.value = `${configValue}`;
      }
    }
  }

  private setConfigValue(config: Obj, key: string, input: HTMLInputElement) {
    switch (typeof config[key]) {
      case "boolean": {
        config[key] = input.checked;
        break;
      }
      case "string": {
        config[key] = input.value;
        break;
      }
      case "number": {
        const v = Number(input.value);
        if (Number.isNaN(v)) return;
        config[key] = v;
        break;
      }
    }
  }
}

new FeatureConfigForm().init();
