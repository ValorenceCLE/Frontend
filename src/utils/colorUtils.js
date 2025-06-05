// src/utils/colorUtils.js

/**
 * Convert HSL to Hex color format
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string (e.g., "#ff0000")
 */
export function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert Hex to HSL color format
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {object} HSL object with hue, saturation, luminosity
 */
export function hexToHsl(hex) {
    if (!hex || !hex.startsWith('#')) {
        return { hue: 0, saturation: 100, luminosity: 50 };
    }

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        hue: Math.round(h * 360),
        saturation: Math.round(s * 100),
        luminosity: Math.round(l * 100)
    };
}

/**
 * Convert legacy color names to hex codes, or pass through hex codes
 * @param {string} color - Color string (could be "red", "green", or "#ff0000")
 * @returns {string} Hex color string
 */
export function normalizeColor(color) {
    if (!color) return null;

    // If already hex, return as-is
    if (typeof color === 'string' && color.startsWith('#')) {
        return color;
    }

    // Legacy color mapping for backward compatibility
    const legacyColors = {
        'red': '#eb191a',
        'green': '#2a980c',
        'yellow': '#FFDF00',
        'blue': '#0a44a3',
        'gray': '#d1d5db',
        'grey': '#d1d5db'
    };

    // Check if it's a legacy color name
    const legacyColor = legacyColors[color?.toLowerCase()];
    if (legacyColor) {
        return legacyColor;
    }

    // Return the color as-is (might be a CSS color name)
    return color;
}

/**
 * Determine if text should be white or black based on background color
 * @param {string} backgroundColor - Hex color string
 * @returns {string} "#ffffff" for white text or "#000000" for black text
 */
export function getContrastTextColor(backgroundColor) {
    if (!backgroundColor || !backgroundColor.startsWith('#')) {
        return '#ffffff'; // Default to white
    }

    let hex = backgroundColor.replace('#', '');

    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance using the standard formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Return black text for light backgrounds, white for dark
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    return '#ffffff'; // Fallback to white
}

/**
 * Validate if a string is a valid hex color
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHex(color) {
    if (!color || typeof color !== 'string') return false;
    return /^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color);
}

/**
 * Ensure a color is valid, converting legacy names to hex and providing fallback
 * @param {string} color - Color to validate/convert
 * @param {string} defaultColor - Default color to return if invalid
 * @returns {string} Valid hex color
 */
export function ensureValidHex(color, defaultColor = '#d1d5db') {
    // First try to normalize the color (convert legacy names to hex)
    const normalized = normalizeColor(color);

    // If it's a valid hex now, return it
    if (isValidHex(normalized)) {
        return normalized;
    }

    // If it's a CSS color name, return it as-is (browsers can handle it)
    const cssColors = [
        'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown',
        'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
        'teal', 'silver', 'maroon', 'olive', 'aqua', 'fuchsia'
    ];

    if (normalized && cssColors.includes(normalized.toLowerCase())) {
        return normalized.toLowerCase();
    }

    // Fallback to default
    return defaultColor;
}

/**
 * Default colors for relay buttons
 */
export const DEFAULT_COLORS = {
    on: '#2a980c',    // Green
    off: '#eb191a',   // Red
    pulse: '#FFDF00'  // Yellow
};

/**
 * Create default dashboard configuration with hex colors
 * @returns {object} Default dashboard configuration
 */
export function createDefaultDashboard() {
    return {
        on_button: {
            show: false,
            status_text: "On",
            status_color: DEFAULT_COLORS.on,
            button_label: "On"
        },
        off_button: {
            show: false,
            status_text: "Off",
            status_color: DEFAULT_COLORS.off,
            button_label: "Off"
        },
        pulse_button: {
            show: false,
            status_text: "Pulsing...",
            status_color: DEFAULT_COLORS.pulse,
            button_label: "Pulse"
        },
    };
}