import { writeFile } from "node:fs/promises";
import { jaJP } from "../src/i18n/ja-JP";
import { STORE_DESCRIPTION_END } from "../src/utils/constants";

function renderStoreDescription(
  title: string,
  content: string,
  spaceBetweenWords = "",
) {
  let ended = false;
  const setEnded = () => {
    ended = true;
  };

  return `# ${title}

    ${content}`
    .trim()
    .split("\n\n")
    .map((paragraph) =>
      paragraph.trim().replaceAll(/\n\s*/g, spaceBetweenWords),
    )
    .map((line) =>
      ended || line.startsWith("![img] ")
        ? ""
        : line === STORE_DESCRIPTION_END
          ? setEnded()
          : line.startsWith("# ")
            ? `\n\n${line.slice(2)}\n${"-".repeat(60)}\n`
            : `${line.replaceAll("<br/>", "")}\n`,
    )
    .join("");
}

function renderMarkdown(
  title: string,
  content: string,
  spaceBetweenWords = "",
) {
  const img = (line: string) => {
    const matches = line.match(/!\[(.+?)\] (.+)/);
    if (!matches) throw new Error(`invalid img line: ${line}`);
    const alt = matches.at(1);
    const imgFileName = matches.at(2);
    if (!alt || !imgFileName) throw new Error(`invalid img line: ${line}`);
    return `<img src="./dist/assets/${imgFileName}" alt="${alt}" width="600px" />`;
  };

  return `# ${title}

    ${content}`
    .trim()
    .split("\n\n")
    .filter((paragraph) => paragraph.trim() !== STORE_DESCRIPTION_END)
    .map((paragraph) =>
      paragraph.trim().replaceAll(/\n\s*/g, spaceBetweenWords),
    )
    .map((line) =>
      line.startsWith("![img] ")
        ? img(line)
        : line.startsWith("# ")
          ? `\n\n#${line}`
          : line.startsWith("## ")
            ? `#${line}`
            : line.replaceAll("<br/>", "  \n"),
    )
    .join("\n\n");
}

async function write(
  langTable: typeof jaJP,
  initialStr: string,
  renderFn: typeof renderStoreDescription | typeof renderMarkdown,
  outputFileName: string,
) {
  let result = initialStr;

  for (const v of Object.values(langTable.configUI)) {
    if (typeof v !== "object") continue;
    if (!("isEnabled" in v) || !("helpModal" in v)) continue;
    result += renderFn(v.isEnabled, v.helpModal);
  }

  await writeFile(
    outputFileName,
    new Uint8Array(Buffer.from(result.trim())),
  ).catch((e) => console.error(e));
}

async function writeStoreDescription() {
  await write(
    jaJP,
    `Notion でのコラボレーションをよりスムーズにするためのツールです。
以下、機能一覧と簡単な説明です。

画像付きのより詳しい説明はこちらをご覧ください。
https://github.com/shiradofu/co-notion
`,
    renderStoreDescription,
    "README.txt",
  );
}

async function writeMarkdown() {
  await write(
    jaJP,
    `
<p align="center">
  <img src="https://github.com/user-attachments/assets/e722ddd4-2237-434f-8175-58d6c1b76382" />
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/co-notion/jmoihmhigfijpobomcdflaeoenkfmpkb">Chrome Web Store</a>
</p>

# 機能一覧`,
    renderMarkdown,
    "README.md",
  );
}

(async () => await Promise.all([writeStoreDescription(), writeMarkdown()]))();
