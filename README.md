# twind-capsize

> A Twind plugin that mimics the behaviour of seek-oss capsize

![@twind/capsize](https://user-images.githubusercontent.com/1457604/116946616-830f4f80-ac72-11eb-8f39-01401e14b465.png)

[Capsize](https://seek-oss.github.io/capsize) makes the sizing and layout of text as predictable as every other element on the screen. Using font metadata, text can now be sized according to the height of its capital letters while trimming the space above capital letters and below the baseline.

This Twind plugin allows for the application of the above behaviours using shorthand like `cap-serif-3xl-tight`.

## Installation

```sh
npm install @twind/capsize
```

## Usage

The Twind integration here is just a function and works like any other plugin:

```js
import { setup } from 'twind/shim'
import { capsize } from '@twind/capsize'

setup({
  plugins: { cap: capsize },
})
```

Once set up, invoke the plugin with the following syntax in your HTML or JSX:

```html
<h1 class="cap-sans-3xl-tight">The quick brown fox jumped over the lazy dog</h1>
```

## Options

The plugin expects some arguments after the plugin name (i.e. `cap` in this instance):

- `fontFamily` (required): from the theme, for example `sans|serif|mono`
- `fontSize` (required): from the theme, for example `sm|base|lg|xl`
- `lineHeight` (optional): from the theme, for example `normal|relaxed|loose`

The appropriate corrections will be applied to an element according to these arguments and the relating values in your theme file. For convenience, some of the font metrics for default fonts on Windows, Mac and Android are included with the plugin, along with a function that uses canvas to detect what font is being used by the browser from any given font family.

> 💡 It is possible to generate metrics for any font using the [tool on the capsize homepage](https://seek-oss.github.io/capsize/)

If you are using a custom font stack then you will need to supply the appropriate font metrics in your theme:

```js
import { setup } from 'https://cdn.skypack.dev/twind/shim'
import { capsize } from 'https://cdn.skypack.dev/@twind/capsize'

setup({
  theme: {
    fontMetrics: {
      Lato: {
        capHeight: 1433,
        ascent: 1974,
        descent: -426,
        lineGap: 0,
        unitsPerEm: 2000,
      },
    },
    extend: {
      fontFamily: {
        display: ['Lato', 'sans-serif'],
      },
    },
  },
  plugins: {
    cap: capsize,
  },
})
```

Then use the plugin in the same way as before but providing the name of the custom font stack as the first argument:

```html
<h1 class="cap-display-7xl">The quick brown fox jumped over the lazy dog</h1>
```

## Known Limitations

- If the browser chooses a font in a font family that there are no font metrice for then the line height and before/after offsets will unlikely be applied correctly. To guarantee correctness make sure font metrics exist for all fonts in all font families.
- If a custom font hasn't loaded before a rule is parsed then line heights will be calculated relative to the font that the browser is rendering with at the point of parsing. This is likely only to happen on very first page load (before any custom font has been cached) and essentially just reverts to the browsers default type settings.

## Acknowledgements

This project was inspired by and vendors code from [Capsize](https://seek-oss.github.io/capsize/) and [DetectFont](https://github.com/Wildhoney/DetectFont).
