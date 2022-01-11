import { vec4 } from '../types/tuples';

// excerpt from webgl-operate
// https://github.com/cginternals/webgl-operate/blob/master/source/color.ts

const DEFAULT_ALPHA: GLclampf = 1.0;
const HEX_FORMAT_REGEX = new RegExp(/^(#|0x)?(([0-9a-f]{3}){1,2}|([0-9a-f]{4}){1,2})$/i);

/**
 * Converts a color from HEX string to RGBA space. The hex string can start
 * with '#' or '0x' or neither of these.
 * @param hex - Hexadecimal color string: red, green, and blue,
 * each in ['00', 'ff'].
 * @returns - RGBA color tuple: red, green, blue, and alpha,
 * each in [0.0, 1.0]. On error [0, 0, 0, 0] is returned.
 */
export function hex2rgba(hex: string, failSilent = false): vec4 {
    const rgba: vec4 = [0.0, 0.0, 0.0, DEFAULT_ALPHA];

    if (!HEX_FORMAT_REGEX.test(hex)) {
        if (!failSilent) {
            console.warn(
                'hexadecimal RGBA color string must conform to either',
                '#0000, or #00000000, given',
                hex
            );
        }
        return rgba;
    }

    const offset = hex.startsWith('0x') ? 2 : hex.startsWith('#') ? 1 : 0;
    const length = Math.floor((hex.length - offset) / 3);
    const stride = length - 1;

    rgba[0] = parseInt(hex[offset + 0 * length] + hex[offset + 0 * length + stride], 16) / 255.0;
    rgba[1] = parseInt(hex[offset + 1 * length] + hex[offset + 1 * length + stride], 16) / 255.0;
    rgba[2] = parseInt(hex[offset + 2 * length] + hex[offset + 2 * length + stride], 16) / 255.0;
    if (hex.length - offset === 4 || hex.length - offset === 8) {
        rgba[3] =
            parseInt(hex[offset + 3 * length] + hex[offset + 3 * length + stride], 16) / 255.0;
    }

    if (!failSilent && (isNaN(rgba[0]) || isNaN(rgba[1]) || isNaN(rgba[2]) || isNaN(rgba[3]))) {
        console.warn(`expected well formatted hexadecimal RGBA string, given '${hex}'`);
    }
    return rgba;
}
