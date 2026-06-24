# Change Log

All notable changes to the "hcpworks" extension will be documented in this file.

## [0.0.14]

- Data name matching now ignores `<ins>` / `<del>` decoration tags
    - `\data <ins>counter</ins>` and `\out counter` are treated as the same data name
    - Applied consistently to duplicate removal in data definitions, merge of process I/O data, and process-data wire connection matching

## [0.0.13]

- Preview no longer steals focus when opened from the module list

- Display `\table` and the diagram in vertically split panes that can be scrolled independently.
    - Allow the splitter between the table pane and the SVG pane to be dragged to resize their heights.
    - If there is no table, display only the diagram at full size as before.
    - Enable zooming with Ctrl+Wheel only in the SVG pane, without interfering with scrolling in the table pane.

- Supports `<ins>` / `<del>` text decoration inside `\table` cells
    - Cell text remains HTML-escaped except for supported decoration tags and `<br>` line breaks
    - Decorated ranges use a high-contrast text color for readability on highlighted backgrounds
    - Invalid nested or unmatched decoration tags are shown with the same error highlight as chart text

- Lines entirely wrapped in parentheses (half-width `(...)` or full-width `（...）`) are now rendered as grey supplementary annotations instead of being silently ignored
    - Applies to any process line whose trimmed content starts with `(` / `（` and ends with `)` / `）`
    - Displayed in italic grey text; no shape is drawn — a pass-through vertical line replaces the circle so the flow line remains unbroken
    - Indent level is respected: if the supplementary line is at a sub-level, its X position follows the same level shift as other elements
    - An endpoint marker is drawn when the supplementary line is the last element at its level
- `\data (...)` / `\data （...）` is rendered in the data column as grey supplementary text
    - Useful for noting referenced data or side-effects that are not formal inputs/outputs

- Add VSCode settings to control visibility of `Name`, `scope`, and `kind` fields in chart preview/export
    - `hcpworks.headerDisplay.showName` (default: true) — toggle the `Name:` header
    - `hcpworks.headerDisplay.showScope` (default: true) — toggle the `scope:` line
    - `hcpworks.headerDisplay.showKind` (default: true) — toggle the `kind:` line
    - Settings are grouped under `headerDisplay` for extensibility (future fields such as Author or edit date use the same prefix)

## [0.0.12]

- Supports multiple image formats on save (PNG / SVG / WebP / JPEG)
    - A format picker is shown when saving; each option lists a short description
    - PNG / WebP / JPEG are rasterized in the preview at 2x resolution (no extra dependencies; uses the webview canvas)
    - SVG is saved as before (vector, lossless)
    - File naming convention is now `<fileName>_<moduleName>.<extension>`

## [0.0.11]

- Supports `<ins>` notation (insertion highlight)
    - Highlights the range enclosed by `<ins>` and `</ins>` with a light-green background to indicate newly added or changed text
    - Nested tags, a different tag mixed in, or unmatched open/close are shown as a notation error with a red background (applies to `<del>` as well)
- Supports `<del>` notation (strikethrough)
    - Draws a strikethrough over the range enclosed by `<del>` and `</del>`, and highlights it with a salmon-pink background
- Supports `\drop` notation (discard of output data)
    - Written like `\out` but neither connected to the data section nor drawn
- Supports module metadata notation (`\kind`, `\scope`)
    - Write them between `\module` and `\table`; values are free-form
    - Shown below `Name:` as labeled lines (`scope: <value>` / `kind: <value>`, included in image output)
- update `\table` notation (CSV-like tables)
    - `<br>` in a cell becomes a line break (in-cell line break when pasted into Excel with formatting)
- bug Fixed
    - Arrow overlapped the trailing character when a text contained many consecutive half-width characters
    - Text width is now accumulated directly in px per character type (instead of rounding to full-width units), matching the monospace font metrics

## [0.0.10]

- Supports `\table` notation (CSV-like tables)
    - Write it between `\module` and `\data`
    - Consecutive commas are merged into a single separator
    - Leading indentation expresses struct-member (parent-child) hierarchy
    - Caption can be added with `\table <name>`
    - Rendered in preview only (not included in image output)

## [0.0.9]

- vulnerability fix

## [0.0.8]

- update Readme
- Supports drawing level specification
- Supports configuration to wire color table

## [0.0.7]

- bux Fixed
    - Syntax highlighting was disabled
- update Readme
- Supports configuration to background color

## [0.0.6]

- update icon image.
- update menu contents. Save / Refresh

## [0.0.5]

- bux Fixed
    - Garbled characters in SJIS
- update Readme

## [0.0.4]

- bux Fixed
    - Changes to module selection method.
- update Readme

## [0.0.3]

- bux Fixed
    - The data section overlaps the processing section.
- prepare Documentation

## [0.0.2]

- Initial release

## [0.0.1]

- Work
- Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.
