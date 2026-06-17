/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      /* ── Colors from DESIGN.md ── */
      colors: {
        ink:        '#000000',
        'on-dark':  '#ffffff',
        'canvas-night':          '#000000',
        'canvas-night-elevated': '#0a0a0a',
        'canvas-light':          '#ffffff',
        'canvas-cream':          '#fbfbf5',
        'surface-dark':          '#1e2c31',
        shade: {
          30: '#d4d4d8',
          40: '#a1a1aa',
          50: '#71717a',
          60: '#52525b',
          70: '#3f3f46',
        },
        hairline: {
          light: '#e4e4e7',
          dark:  '#1e2c31',
        },
        aloe:      { 10: '#c1fbd4' },
        pistachio: { 10: '#d4f9e0' },
        'link-cool': {
          1: '#9dabad',
          2: '#9797a2',
          3: '#bdbdca',
        },
        'link-mint': '#99b3ad',
      },

      /* ── Typography ── */
      fontFamily: {
        display: ['"Inter Display"', '"Inter"', 'Helvetica', 'Arial', 'sans-serif'],
        body:    ['"Inter Variable"', '"Inter"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },

      /* ── Rounded (pill is key) ── */
      borderRadius: {
        xs:   '4px',
        sm:   '5px',
        md:   '8px',
        lg:   '12px',
        xl:   '20px',
        pill: '9999px',
      },

      /* ── Spacing ── */
      spacing: {
        xxs:  '2px',
        xs:   '4px',
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        xxl:  '32px',
        huge: '64px',
      },

      /* ── Shadows (Elevation from DESIGN.md) ── */
      boxShadow: {
        'elev-1': '0 1px 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
        'elev-2': '0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)',
        'elev-3': '0 8px 8px rgba(0,0,0,0.1), 0 4px 4px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.1)',
        'elev-4': '0 25px 50px -12px rgba(0,0,0,0.25)',
      },

      /* ── Font sizes ── */
      fontSize: {
        'display-xxl': ['96px',  { lineHeight: '1.0',  letterSpacing: '2.4px'  }],
        'display-xl':  ['70px',  { lineHeight: '1.0',  letterSpacing: '0'      }],
        'display-lg':  ['55px',  { lineHeight: '1.16', letterSpacing: '0'      }],
        'display-md':  ['48px',  { lineHeight: '1.14', letterSpacing: '0'      }],
        'heading-xl':  ['28px',  { lineHeight: '1.28', letterSpacing: '0.42px' }],
        'heading-lg':  ['24px',  { lineHeight: '1.14', letterSpacing: '0.36px' }],
        'heading-md':  ['20px',  { lineHeight: '1.4',  letterSpacing: '0.3px'  }],
        'heading-sm':  ['18px',  { lineHeight: '1.25', letterSpacing: '0.72px' }],
        'body-lg':     ['18px',  { lineHeight: '1.56', letterSpacing: '0'      }],
        'body-md':     ['16px',  { lineHeight: '1.5',  letterSpacing: '0'      }],
        'caption':     ['14px',  { lineHeight: '1.49', letterSpacing: '0.28px' }],
        'micro':       ['13px',  { lineHeight: '1.5',  letterSpacing: '-0.13px'}],
        'eyebrow':     ['12px',  { lineHeight: '1.2',  letterSpacing: '0.72px' }],
      },
    },
  },
  plugins: [],
}
