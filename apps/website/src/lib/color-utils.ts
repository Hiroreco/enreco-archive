import { default as colorParse } from "color-parse";
import { default as colorSpace } from 'color-space';

const DARK_BG_COLOR: [number, number, number] = [52, 52, 51];
const LIGHT_BG_COLOR: [number, number, number] = [252, 252, 251];
const TARGET_CONTRAST_RATIO = 4.5;

/*
Calculates the relative luminance as described in:
https://www.w3.org/TR/WCAG20/#relativeluminancedef
This is used as part of the contrast ratio calculation.
*/
function calcRelativeLuminance(rgbValues: [number, number, number]) {
    function calcComponentLuminance(componentVal: number) {
        const normComponentVal = componentVal / 255;
        if(normComponentVal <= 0.03928) {
            return normComponentVal / 12.92;
        }
        else {
            return Math.pow((normComponentVal + 0.055) / 1.055, 2.4);
        }
    }

    return (calcComponentLuminance(rgbValues[0]) * 0.2126) + 
        (calcComponentLuminance(rgbValues[1]) * 0.7152) +
        (calcComponentLuminance(rgbValues[2]) * 0.0722); 
}

/*
Calculates the contrast ratio. While the calculation itself is quite simple,
the lighter color always must be in the dividend of the calculation.
*/
function calcContrastRatio(l1: number, l2: number) {
    if(l1 > l2) {
        return (l1 + 0.05) / (l2 + 0.05);
    }
    else {
        return (l2 + 0.05) / (l1 + 0.05);
    }
}

/*
Find the closest color that has a greater then or equal contrast ratio to the background.
The basic algorithm for this function is
- calculate contrast ratio between bg and link color
- if the contrast ratio is high enough, return original color
- otherwise while contrast ratio is not high enough
  - convert link color from rgb to hsl
  - add/subtract 1% lightness if we are in dark/light mode
  - convert new hsl values back into rgb and recalculate the contrast ratio
- return new color

More information about the concept of color contrast ratio can be found here
https://www.accessibility-developer-guide.com/knowledge/colours-and-contrast/how-to-calculate/
*/
export function getContrastedColor(color: string, isDarkMode: boolean) {
    const linkColorRgb = colorParse(color);
    const linkColorLuminance = calcRelativeLuminance([linkColorRgb.values[0], linkColorRgb.values[1], linkColorRgb.values[2]]);
    const bgColorLuminance = calcRelativeLuminance(isDarkMode ? DARK_BG_COLOR : LIGHT_BG_COLOR);
    let contrastRatio = calcContrastRatio(linkColorLuminance, bgColorLuminance);

    if(contrastRatio >= TARGET_CONTRAST_RATIO) {
        return color;
    }

    const linkColorHsl = colorSpace.rgb.hsl([linkColorRgb.values[0], linkColorRgb.values[1], linkColorRgb.values[2]]);

    while(contrastRatio < TARGET_CONTRAST_RATIO && (linkColorHsl[2] < 100 || linkColorHsl[2] > 0)) {
        if(!isDarkMode) {
            linkColorHsl[2] = Math.max(linkColorHsl[2] - 1, 0);
        }
        else {
            linkColorHsl[2] = Math.min(linkColorHsl[2] + 1, 100);
        }
        const newColorRgb = colorSpace.hsl.rgb(linkColorHsl);
        const newLuminance = calcRelativeLuminance(newColorRgb);
        contrastRatio = calcContrastRatio(newLuminance, bgColorLuminance);
    }

    const newColorRgb = colorSpace.hsl.rgb(linkColorHsl);

    // Convert rgb color back into html hex color code.
    const r = Math.trunc(newColorRgb[0]).toString(16).padStart(2, "0");
    const g = Math.trunc(newColorRgb[1]).toString(16).padStart(2, "0");
    const b = Math.trunc(newColorRgb[2]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
}