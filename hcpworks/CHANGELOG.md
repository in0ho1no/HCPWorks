# Change Log

All notable changes to the "hcpworks" extension will be documented in this file.

## [0.1.5]

Patch

- vulnerability fix
    - Updated dependencies (fast-uri, etc.)
- No change to the behavior of the extension itself

## [0.1.4]

Patch

- Fixed the image save path being truncated at the first dot found anywhere in the source file path
    - A `.hcp` file under a directory whose name contains a dot (e.g. `my.project/`) was saved outside of its own folder
    - A file name containing a dot (e.g. `foo.v2.hcp`) lost everything after that dot, so `foo.v1.hcp` and `foo.v2.hcp` overwrote each other's output
- Limited the rasterized image size so a large chart no longer exports as a blank image
    - The longer side is capped at 8192 pixels; the 2x scale is reduced only when it would exceed that
    - A chart of roughly 150 process lines or more was already large enough to hit the canvas limit
- Added a toolbar at the top of the preview with "Reset View" and "Copy Image"
    - Reset View restores the zoom to 100% and scrolls back to the top-left, as a way out of being lost while zoomed in
    - Copy Image copies the chart to the clipboard as a PNG, so it can be pasted straight into another application
    - The copied image follows the same 8192 pixel limit as the exported image
    - Double-clicking the chart still resets the zoom only, leaving the scroll position untouched
    - "HCPWorks: Reset Preview Zoom and Position" is still available from the Command Palette
- The preview now remembers the zoom, the scroll position, and the table pane height
    - The state is kept per module (source file + module name), so switching modules no longer applies the view of the previous one
    - Restored values are clamped to the current window, so a pane height saved in a larger window no longer fills the preview
    - The 20 most recently viewed modules are kept; older ones are dropped
    - The state lives as long as the preview panel does; closing the panel discards it
    - Use Reset View in the toolbar to get back to the whole chart when a restored zoom leaves you lost
- Added `\#` as an escape for the comment marker, so a `#` can now be used as a literal character
    - `#` still starts a comment that runs to the end of the line, which previously made text such as `\mod C#で実装する` lose everything after the `#`
    - Works the same way in process lines, data lines, `\kind` / `\scope` values, and `\table` captions and cells
- A trailing comment on a `\module` line is no longer taken as part of the module name
    - `\module foo # note` was listed as `foo # note` in the module list and used as-is in the exported image file name
- The preview now refreshes immediately when a header display setting (`hcpworks.headerDisplay.showName` / `showScope` / `showKind`) is changed
    - Previously the new setting was not applied until the file was saved or the preview was refreshed manually

## [0.1.3]

Patch

- vulnerability fix
    - Updated dependencies (brace-expansion, fast-uri, linkify-it, etc.)
    - Removed the fast-uri version override since the fixed version is now provided upstream
- update icon images (file icon / preview icon)

## [0.1.2]

Minor

- Improved readability of wire lines between the process and data sections
    - Vertical wire lines share the same X coordinate when their Y ranges do not overlap, compressing the chart width
    - Horizontal wire lines jump over crossing vertical lines with small arcs (Visio-style line jumps)
    - A wire entering the data section is routed to the right of any wire leaving a process at the same height, so an incoming line never overlaps an outgoing line
    - Vertical wire lines are drawn before horizontal ones, so jump arcs are always painted above the vertical lines they cross
- Changed the default wire color table to an Okabe-Ito based palette
    - Avoids pure black (indistinguishable from structural lines) and low-contrast colors on white backgrounds (pure yellow/green/turquoise), and is friendly to color vision deficiency
- The preview tab now shows the source file and module (`fileName - moduleName`, extension omitted) instead of the fixed "HCP Preview" title, and uses a dedicated preview icon

## [0.1.1]

Patch

- Preserve the preview scroll position as much as possible when the preview refreshes after saving a file
- Added new types for automatic bracket pair completion (automatic insertion of closing brackets) and automatic wrapping:
    - Half-width: `<>`
    - Full-width: `＜＞`

## [0.1.0]

- Apply HCPWorks file icon to `.hcp` files while the extension is enabled
- Auto-closing and auto-surrounding bracket pairs are now supported in `.hcp` files without any user configuration
    - Half-width: `()` `[]` `{}` `""` `''` ` `` `
    - Full-width: `（）` `［］` `｛｝`
    - Japanese: `「」` `『』` `【】` `《》` `〈〉` `〔〕` `〖〗` `〘〙`
- `.hcp` ファイルで `\module` および `\table` による折り畳み（コードフォールディング）をサポート
    - `\module`: 次の `\module` が来るまでの範囲を折り畳む
    - `\table`: 空行・`\data`・次の `\table`・`\module` のいずれかが来るまでの範囲を折り畳む

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
