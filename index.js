const BASE_FONTS = ['sans-serif', 'serif', 'monospace'];
const BASE_FONT_METRICS = {
  // Android Fonts
  Roboto: {
    capHeight: 1456,
    ascent: 1900,
    descent: -500,
    lineGap: 0,
    unitsPerEm: 2048,
  },
  RobotoMono: {
    capHeight: 1456,
    ascent: 2146,
    descent: -555,
    lineGap: 0,
    unitsPerEm: 2048,
  },
  // Windows Fonts
  SegoeUI: {
    capHeight: 1434,
    ascent: 2210,
    descent: -514,
    lineGap: 0,
    unitsPerEm: 2048,
  },
  Consolas: {
    capHeight: 1307,
    ascent: 1521,
    descent: -527,
    lineGap: 350,
    unitsPerEm: 2048,
  },
  // Apple Fonts
  SFPro: {
    capHeight: 1450,
    ascent: 1950,
    descent: -420,
    lineGap: 0,
    unitsPerEm: 2048,
  },
  Menlo: {
    capHeight: 1493,
    ascent: 1901,
    descent: -483,
    lineGap: 0,
    unitsPerEm: 2048,
  },
  Georgia: {
    capHeight: 1419,
    ascent: 1878,
    descent: -449,
    lineGap: 0,
    unitsPerEm: 2048,
  },
};

const OS_FONTS = {
  windows: { sans: 'SegoeUI' },
  apple: { sans: 'SFPro', mono: 'Menlo', serif: 'Georgia' },
  android: { sans: 'Roboto', mono: 'RobotoMono' },
};

const fontsForOS = () => {
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent;
    if (/iPhone|iPad|Mac/.test(userAgent)) {
      return OS_FONTS.apple;
    } else if (/Windows/.test(userAgent)) {
      return OS_FONTS.windows;
    } else if (/Android/.test(userAgent)) {
      return OS_FONTS.android;
    }
  }
  return OS_FONTS.apple;
};

/* Adapted from https://github.com/Wildhoney/DetectFont/blob/master/src/detect-font.js */

const removeQuotes = (name) => {
  const matches = String(name).match(/^["']?(.+?)["']?$/i);
  return Array.isArray(matches) ? matches[1] : '';
};

const detectFont = (family) => {
  const opts = {
    text: 'abcdefghijklmnopqrstuvwxyz0123456789',
    fontSize: 72,
    baseFont: 'sans-serif',
  };

  const fontFamily = family || 'sans-serif';
  const fonts = fontFamily.split(',');
  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');

  const usedFont = fonts
    .map((font) => {
      const fontName = removeQuotes(font.trim());
      if (!!~BASE_FONTS.indexOf(fontName.toLowerCase())) {
        return fontName;
      }
      context.font = `${opts.fontSize}px ${opts.baseFont}`;
      const baselineSize = context.measureText(opts.text).width;
      context.font = `${opts.fontSize}px ${fontName}, ${opts.baseFont}`;
      return baselineSize !== context.measureText(opts.text).width && fontName;
    })
    .filter(Boolean)[0];

  return usedFont;
};

const lineHeightToRem = (lineHeight, fontSize) => {
  return lineHeight.endsWith('rem')
    ? lineHeight
    : parseFloat(lineHeight) * parseFloat(fontSize) + 'rem';
};

const remToPixels = (rem) => {
  return (
    +rem.replace('rem', '') *
    parseFloat(
      typeof document !== 'undefined'
        ? getComputedStyle(document.documentElement).fontSize
        : 16
    )
  );
};

/* Adapted from https://github.com/seek-oss/capsize/blob/master/packages/capsize/src/index.ts */

const roundTo = (value, places) => {
  var rtn = 0;
  var factorial = Math.pow(10, places);
  rtn = Math.round(value * factorial);
  rtn = rtn / factorial;
  return rtn;
};

const preventCollapse = 0.05;
const PRECISION = 4;

const css = ({ lineHeight, fontSize, fontMetrics = {} }) => {
  const absoluteDescent = Math.abs(fontMetrics.descent);
  const capHeightScale = fontMetrics.capHeight / fontMetrics.unitsPerEm;
  const descentScale = absoluteDescent / fontMetrics.unitsPerEm;
  const ascentScale = fontMetrics.ascent / fontMetrics.unitsPerEm;
  const lineGapScale = fontMetrics.lineGap / fontMetrics.unitsPerEm;
  const contentArea =
    fontMetrics.ascent + fontMetrics.lineGap + absoluteDescent;
  const lineHeightScale = contentArea / fontMetrics.unitsPerEm;
  const lineHeightNormal = lineHeightScale * fontSize;
  const specifiedLineHeightOffset = lineHeight
    ? (lineHeightNormal - lineHeight) / 2
    : 0;

  const toScale = (value) => value / fontSize;
  const leadingTrim = (value) =>
    value - toScale(specifiedLineHeightOffset) + toScale(preventCollapse);

  return {
    fontSize: `${roundTo(fontSize, PRECISION)}px`,
    lineHeight: lineHeight ? `${roundTo(lineHeight, PRECISION)}px` : 'normal',
    padding: `${preventCollapse}px 0`,
    '&::before': {
      content: "''",
      marginTop: `${roundTo(
        leadingTrim(ascentScale - capHeightScale + lineGapScale / 2) * -1,
        PRECISION
      )}em`,
      display: 'block',
      height: 0,
    },
    '&::after': {
      content: "''",
      marginBottom: `${roundTo(
        leadingTrim(descentScale + lineGapScale / 2) * -1,
        PRECISION
      )}em`,
      display: 'block',
      height: 0,
    },
  };
};

export const capsize = (parts, { theme }) => {
  const fontStyle = parts[0];
  const fontFamily = theme('fontFamily', fontStyle);
  const usedFont = detectFont(fontFamily);
  const detectedFont =
    usedFont === 'system-ui' ? fontsForOS()[fontStyle] : usedFont;
  const [fontSize, lineHeight] =
    theme('fontSize', parts[1]) || theme('fontSize', 'base');
  const customLineHeight = parts[2] && theme('lineHeight', parts[2]);
  return {
    fontFamily,
    ...css({
      fontSize: remToPixels(fontSize),
      lineHeight: remToPixels(
        lineHeightToRem(customLineHeight || lineHeight, fontSize)
      ),
      fontMetrics:
        BASE_FONT_METRICS[detectedFont] || theme('fontMetrics', detectedFont),
    }),
  };
};
