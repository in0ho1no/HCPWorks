[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/in0ho1no/HCPWorks/blob/main/hcpworks/LICENSE)
[![VSCode Extension Test](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml/badge.svg)](https://github.com/in0ho1no/HCPWorks/actions/workflows/unittest.yml)
[![Release](https://img.shields.io/github/v/release/in0ho1no/HCPWorks)](https://github.com/in0ho1no/HCPWorks/releases)

日本語版の README.md は <[こちら](README.ja.md)>.

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

#### Reload

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

### Support Syntax Highlight

This extension supports syntax highlighting as shown in the image below.

![syntaxHighlight](hcpworks/resources/images/syntaxHighlight.png)

## Known Issues

There are no known issues.  
If you find any issues, please report them on the [Github issue](https://github.com/in0ho1no/HCPWorks/issues).

## Release Notes

Check the [CHANGELOG](hcpworks/CHANGELOG.md).
