# Change Log

All notable changes to the "hcpworks" extension will be documented in this file.

## [0.0.10]

- Supports `\table` notation (CSV-like tables)
    - Write it between `\module` and `\data`
    - Consecutive commas are merged into a single separator
    - Leading indentation expresses struct-member (parent-child) hierarchy
    - Caption can be added with `\table <name>`
    - `<br>` in a cell becomes a line break (in-cell line break when pasted into Excel with formatting)
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
