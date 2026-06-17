[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/in0ho1no/HCPWorks/blob/main/hcpworks/LICENSE)
[![VSCode Extension Test](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml/badge.svg)](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml)
[![Release](https://img.shields.io/github/v/release/in0ho1no/HCPWorks)](https://github.com/in0ho1no/HCPWorks/releases)
[![Known Vulnerabilities](https://snyk.io/test/github/in0ho1no/HCPWorks/badge.svg?targetFile=hcpworks/package.json)](https://snyk.io/test/github/in0ho1no/HCPWorks?targetFile=hcpworks/package.json)

日本語版の README.md は <[こちら](README.md)>.

# About HCPWorks

HCPWorks is a VSCode extension that allows you to preview text files written in the HCP chart format.
It aims to streamline the HCP chart creation process by enabling you to complete it entirely within VSCode.

## Features

### Preview HCP Charts

#### Preview

Preview HCP charts.

1. Select a ".hcp" file.
1. Charts beginning with "\module" are listed.
1. Select any module.
1. The HCP chart is previewed.

![previewHCPCharts](hcpworks/resources/videos/previewHCPCharts.gif)

#### Update Preview

Automatically update preview when file is saved.

1. Edit the previewed ".hcp" file.
1. Save the file.
1. The preview will update automatically.

![reloadHCPCharts](hcpworks/resources/videos/reloadHCPCharts.gif)

#### Save

Save HCP charts.

1. Push the "Save" button displayed on the tab bar.  
The "Save" button will be displayed in the ".hcp" panel or the preview panel.
1. "SVG" images are saved.
1. The naming convention for the created SVG file is: \<fileName>_\<moduleName>.svg

![saveHCPCharts](hcpworks/resources/videos/saveHCPCharts.gif)

#### Specifying the drawing level

You can specify the drawing level for the HCP chart.

1. Enter the level you want to draw. / Use the spin button to specify the level you want to draw.
1. Click "Apply drawing level".
1. The preview will update automatically.

![levelLimit](hcpworks/resources/videos/levelLimit.gif)

### Support Syntax Highlight

This extension supports syntax highlighting as shown in the image below.

![syntaxHighlight](hcpworks/resources/images/syntaxHighlight.png)

## HCP chart notation

- Indentation (4 spaces ∪ tab) based on HCP notation to express levels.
- Each notation described below starts with \\ (backslash) and continues up to the first space character.
- If it does not correspond to the list, it is treated as a simple string.
- A string starting with "#" is considered a comment to the end of the line.

### Notation that can be written at level 0

Notation | Content | Notes
---| --- | ---
\module | Start of module | Be sure to write it together with the module name.
\kind | Change type of the module | Write it between `\module` and `\table`. Free-form value (e.g. new / modified / reused). Shown below `Name:` as `kind: <value>` and included in image output.
\scope | Visibility type of the module | Write it between `\module` and `\table`. Free-form value (e.g. public / private, extern / static). Shown below `Name:` as `scope: <value>` and included in image output.
\table | Description of a table | Write it between `\module` and `\data`. CSV format; consecutive commas are merged into one separator.<br>A caption can be added with `\table <name>`.<br>Leading indentation (tab / 4 spaces = one level) expresses parent-child hierarchy like struct members.<br>Use `<br>` for a line break within a cell (it becomes an in-cell line break when pasted into Excel with formatting).<br>Not included in image output.

### Notation that can be written at level 0 or higher

Notation | Content | Notes
---| --- | ---
\data | Definition of data used in the module | Do not define duplicate data names. If duplicates exist, only the first definition will be used for rendering.
\fork | Conditional branch | -
\true | If the condition of the conditional branch is true | There are no restrictions, but avoid writing two consecutive `\true` notations by mistake.
\false | If the condition of the conditional branch is false |There are no restrictions, but avoid writing two consecutive `\false` notations by mistake.
\branch | If the condition of the conditional branch is not true or false | -
\repeat | Repeat | -
\mod | Function call | -
\return | End of processing | -
### Notation that can be added to levels 0 and above

Notation | Content | Notes
---| --- | ---
\in | Input to processing/function | If written at the lowest indentation level, it is treated as input to the function. <br>If written at any level other than the lowest indentation level, it is treated as simple processing input. <br>If there is no definition in `\data`, it is treated as new data. <br>Do not include spaces or periods.
\out | Output from processing/function | If written at the lowest indentation level, it is treated as output from the function. <br>If written at any level other than the lowest indentation level, it is treated as simple processing output. <br>If there is no definition in `\data`, it will be treated as new data. <br>Do not include spaces or periods.
\drop | Discard of output data | Written like `\out`, but it is neither connected to the data section nor drawn. <br>Used to annotate an intentionally discarded output. <br>Do not include spaces or periods.

### Text decoration

Part of the text in a line can be decorated. It can be combined with line notations such as `\mod`.<br>Each tag is used as a pair (`<del></del>` / `<ins></ins>`). Nested tags, a different tag mixed in, or unmatched open/close are shown as a notation error with a red background.

Notation | Content | Notes
---| --- | ---
`<del>...</del>` | Strikethrough | Draws a strikethrough over the range enclosed by `<del>` and `</del>`, and highlights it with a salmon-pink background.<br>Example: `\mod <del>送信する</del>受信解析する`<br>The decoration tags themselves are not drawn.
`<ins>...</ins>` | Insertion (highlight) | Highlights the range enclosed by `<ins>` and `</ins>` with a light-green background to indicate newly added or changed text.<br>Example: `\mod <ins>受信解析する</ins>`<br>The decoration tags themselves are not drawn.

## Known Issues

For a list of known issues, please refer to our [GitHub issue tracker](https://github.com/in0ho1no/HCPWorks/issues).  
If you encounter any new problems, please report them as a new issue on GitHub.

## Release Notes

Check the [CHANGELOG](hcpworks/CHANGELOG.md).
