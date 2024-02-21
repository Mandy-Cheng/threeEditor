import {
  defineConfig,
  definePreset,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
} from "unocss";

function area(n: number) {
  let position = [] as string[];
  switch (n) {
    case 1:
      position = ["start", "start"];
      break;
    case 2:
      position = ["center", "start"];
      break;
    case 3:
      position = ["end", "start"];
      break;
    case 4:
      position = ["start", "center"];
      break;
    case 5:
      position = ["center", "center"];
      break;
    case 6:
      position = ["end", "center"];
      break;
    case 7:
      position = ["start", "end"];
      break;
    case 8:
      position = ["center", "end"];
      break;
    case 9:
      position = ["end", "end"];
      break;
    case 46:
      position = ["space-between", "center"];
      break;
    case 55:
      position = ["space-around", "center"];
      break;
    default:
      position = [];
      break;
  }
  return position;
}

const presetFlex = definePreset(() => {
  return {
    name: "presetFlex",
    rules: [
      [
        /^flex-(col|row)-(\d+)$/,
        ([, direction, number]) => ({
          display: "flex",
          "flex-direction": direction === "col" ? "column" : "row",
          "justify-content": area(Number(number))[0],
          "align-items": area(Number(number))[1],
        }),
      ],
    ],
  };
});

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons(),
    presetWebFonts(),
    presetFlex(),
  ],
  shortcuts: [
    ["wh-full", "w-full h-full"],
    ["f-c-c", "flex justify-center items-center"],
    ["flex-col", "flex flex-col"],
    ["text-ellipsis", "truncate"],
    [
      "icon-btn",
      "text-16 inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-primary !outline-none",
    ],
  ]
});
