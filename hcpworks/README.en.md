[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/in0ho1no/HCPWorks/blob/main/hcpworks/LICENSE)
[![VSCode Extension Test](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml/badge.svg)](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml)
[![Release](https://img.shields.io/github/v/release/in0ho1no/HCPWorks)](https://github.com/in0ho1no/HCPWorks/releases)
[![Known Vulnerabilities](https://snyk.io/test/github/in0ho1no/HCPWorks/badge.svg?targetFile=hcpworks/package.json)](https://snyk.io/test/github/in0ho1no/HCPWorks?targetFile=hcpworks/package.json)

日本語版の README.md は <[こちら](README.md)>.

# About HCPWorks

HCPWorks is a VS Code extension that makes .hcp files easier to work with.
You can list modules, preview HCP charts side by side, and export them as images.

## What You Can Do

- List \module entries in a .hcp file
- Preview the selected module beside the editor
- Refresh the preview automatically on save
- Export charts as PNG, SVG, WebP, or JPEG
- Change the preview level
- Use syntax highlighting, folding, file icons, and bracket completion

![previewHCPCharts](hcpworks/resources/videos/previewHCPCharts.gif)

## Quick Start

1. Open a .hcp file.
1. Select the \module you want to preview from HCP Module List in the Explorer.
1. The preview opens beside the editor and updates automatically when you save the file.
1. To export an image, use the save button in the preview panel.
1. To change the rendered level, use HCP Preview Level.

### Export Formats

- PNG: good default output
- SVG: good for zooming and re-editing
- WebP: good for smaller files
- JPEG: better for photo-like content; thin text and lines may blur

PNG, WebP, and JPEG are rasterized at 2x resolution. Saved files use the name <fileName>_<moduleName>.<extension>.

## HCP Notation

- Indentation level is represented by tabs or 4 spaces
- Leading keywords (such as \module) determine line semantics
- Lines starting with # are treated as comments

```text
\module sampleModule
\kind modified
\scope public
\data inputValue
\data result
\in inputValue
\mod Validate the input
\out result
\return Exit normally
```

### Notation Allowed at Level 0

| Notation | Meaning | Notes |
| --- | --- | --- |
| \module | Start module | Must be written with a module name |
| \kind | Module change type | Place between \module and \table. Rendered under Name as kind: value and included in exports |
| \scope | Module visibility | Place between \module and \table. Rendered under Name as scope: value and included in exports |
| \table | Supplementary table | Place between \module and \data. CSV-like format; \table title adds a caption. Table content is not included in image exports |

### Notation Allowed at Level 0 or Deeper

| Notation | Meaning | Notes |
| --- | --- | --- |
| \data | Data definition | If duplicated, the first definition is used. \data (note) can render supplementary text |
| \fork | Conditional branch | - |
| \true | True branch | Used under \fork |
| \false | False branch | Used under \fork |
| \branch | Non-boolean branch | - |
| \repeat | Loop | - |
| \mod | Process step | Main processing description |
| \return | End processing | - |

### Additional Notation Allowed at Level 0 or Deeper

| Notation | Meaning | Notes |
| --- | --- | --- |
| \in | Input data | At minimum level it is module input; otherwise process input |
| \out | Output data | At minimum level it is module output; otherwise process output |
| \drop | Discarded output | Written like \out, but intentionally not connected to the data area and not rendered |

For data-name matching between \data and \in / \out, <ins> / <del> tags are ignored.

### Supplementary Note Notation

A whole line enclosed by (...) or （...） is rendered as grey italic supplementary text.

- Applied when trimmed content starts with ( or （ and ends with ) or ）
- In the process area, a pass-through vertical line is used so flow lines remain continuous
- In the data area, \data (note) shows supplementary text

### Text Decoration

You can decorate inline text, including in \mod lines and \table cells.

| Notation | Meaning | Notes |
| --- | --- | --- |
| <del>...</del> | Deletion | Rendered with strikethrough and pink-ish background |
| <ins>...</ins> | Addition/Change | Rendered with green-ish background |

Tags must be properly paired. Nested/mixed/unmatched tags are treated as notation errors.

## Configuration

Search for HCPWorks in VS Code Settings to change these options.

| Setting Key | Description |
| --- | --- |
| hcpworks.SvgBgColor | Background color for preview and export |
| hcpworks.WireColorTable | Wire color list |
| hcpworks.headerDisplay.showName | Show or hide Name |
| hcpworks.headerDisplay.showScope | Show or hide scope |
| hcpworks.headerDisplay.showKind | Show or hide kind |

## Editor Support

- Syntax highlighting for .hcp files
- Folding for \module and \table blocks
- Dedicated file icon for .hcp files
- Auto-closing and auto-surrounding brackets and quotes

## Known Issues

See [GitHub issues](https://github.com/in0ho1no/HCPWorks/issues) for known problems.

## Release Notes

See [CHANGELOG](hcpworks/CHANGELOG.md).
