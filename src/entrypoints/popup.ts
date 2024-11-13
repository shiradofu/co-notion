import { type FeatureConfig, getDefaultFeatureConfig } from "../features";
import { setLang } from "../i18n";
import { ConfigFormSubmission, ConfigList } from "../ui/components";
import { el } from "../ui/el";
import { Log } from "../utils/log";
import { forceMerge } from "../utils/merge";
import { type Obj, getObjValueByCtx } from "../utils/obj";
import { Storage } from "../utils/storage";

class FeatureConfigForm {
  private config: FeatureConfig;
  private _submissionStatus?: boolean;
  private submissionStatusTimer?: NodeJS.Timeout;
  private log = new Log(this.constructor.name);

  constructor() {
    this.config = getDefaultFeatureConfig();
  }

  get isSubmissionSuccess() {
    return this._submissionStatus;
  }

  set isSubmissionSuccess(v: boolean | undefined) {
    clearTimeout(this.submissionStatusTimer);
    this._submissionStatus = v;

    if (v !== undefined) {
      this.renderForm();
      this.submissionStatusTimer = setTimeout(() => {
        this.isSubmissionSuccess = undefined;
      }, 3000);
    } else {
      this.renderSubmission();
    }
  }

  async init() {
    // Keys of objects stored in chrome.storage are force sorted by alphabetically.
    // Overwriting values of defaultFeatureConfig by storage-stored values to use
    // the order we defined.
    forceMerge(this.config, await Storage.sync.get("featureConfig"));
    await setLang();
    this.renderForm();
  }

  private renderForm() {
    const formClass = "ConfigForm";
    const form = el("form", {
      classes: [formClass],
      onSubmit: this.onSubmitForm,
      children: [
        ConfigList({ config: this.config, onChangeInput: this.onChangeInput }),
        ConfigFormSubmission({ isSuccess: this.isSubmissionSuccess }),
      ],
    });
    this.render(formClass, form);
  }

  private renderSubmission() {
    this.render(
      "ConfigFormSubmission",
      ConfigFormSubmission({
        isSuccess: this.isSubmissionSuccess,
      }),
    );
  }

  private render(targetClass: string, element: HTMLElement) {
    const target = document.querySelector<HTMLElement>(`.${targetClass}`);
    if (!target) throw new Error(`${targetClass} not found`);
    target.replaceWith(element);
  }

  private onSubmitForm = (e: Event) => {
    e.preventDefault();
    Storage.sync
      .set("featureConfig", this.config)
      .then(() => {
        this.isSubmissionSuccess = true;
      })
      .catch((e) => {
        this.isSubmissionSuccess = false;
        this.log.local("submit").err(e);
      });
  };

  private onChangeInput = ({ currentTarget: input }: Event) => {
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement
    ) {
      const ctx = input.id.split(".");
      const key = ctx.pop();
      const config = getObjValueByCtx<Obj>(this.config, ctx);
      if (!key || !config || !(key in config)) {
        throw new Error(`${ctx.join(".")} not found in featureConfig table`);
      }

      this.setConfigValue(config, key, input);
    }
  };

  private setConfigValue(
    config: Obj,
    key: string,
    input: HTMLInputElement | HTMLTextAreaElement,
  ) {
    if (input instanceof HTMLTextAreaElement) {
      config[key] = input.value;
      return;
    }
    if (typeof config[key] === "boolean") config[key] = input.checked;
    if (typeof config[key] === "string") config[key] = input.value;
    if (typeof config[key] === "number") {
      const v = Number(input.value);
      if (!Number.isNaN(v)) config[key] = v;
    }
  }
}

new FeatureConfigForm().init();
