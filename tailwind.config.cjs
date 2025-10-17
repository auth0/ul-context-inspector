/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  // Disable preflight so we don't inject global resets into host apps.
  corePlugins: { preflight: false },
  prefix: 'uci-',
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--uci-radius)',
        md: 'calc(var(--uci-radius) - 2px)',
        sm: 'calc(var(--uci-radius) - 4px)'
      },
      colors: {
        // All colors now use namespaced --uci-* variables
        background: 'hsl(var(--uci-background))',
        foreground: 'hsl(var(--uci-foreground))',
        card: {
          DEFAULT: 'hsl(var(--uci-card))',
          foreground: 'hsl(var(--uci-card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--uci-popover))',
          foreground: 'hsl(var(--uci-popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--uci-primary))',
          foreground: 'hsl(var(--uci-primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--uci-secondary))',
          foreground: 'hsl(var(--uci-secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--uci-muted))',
          foreground: 'hsl(var(--uci-muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--uci-accent))',
          foreground: 'hsl(var(--uci-accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--uci-destructive))',
          foreground: 'hsl(var(--uci-destructive-foreground))'
        },
        border: 'hsl(var(--uci-border))',
        input: 'hsl(var(--uci-input))',
        ring: 'hsl(var(--uci-ring))',
        chart: {
          '1': 'hsl(var(--uci-chart-1))',
          '2': 'hsl(var(--uci-chart-2))',
          '3': 'hsl(var(--uci-chart-3))',
          '4': 'hsl(var(--uci-chart-4))',
          '5': 'hsl(var(--uci-chart-5))'
        }
      },
      boxShadow: {
        'button-resting': 'var(--uci-shadow-button-resting)',
        'button-hover': 'var(--uci-shadow-button-hover)',
        'button-destructive-resting': 'var(--uci-shadow-button-destructive-resting)',
        'button-destructive-hover': 'var(--uci-shadow-button-destructive-hover)',
        'button-outlined-resting': 'var(--uci-shadow-button-outlined-resting)',
        'button-outlined-hover': 'var(--uci-shadow-button-outlined-hover)',
        'input-resting': 'var(--uci-shadow-input-resting)',
        'input-hover': 'var(--uci-shadow-input-hover)',
        'input-destructive-resting': 'var(--uci-shadow-input-destructive-resting)',
        'input-destructive-hover': 'var(--uci-shadow-input-destructive-hover)',
        'input-destructive-focus': 'var(--uci-shadow-input-destructive-focus)',
        'checkbox-resting': 'var(--uci-shadow-checkbox-resting)',
        'checkbox-hover': 'var(--uci-shadow-checkbox-hover)',
        'switch-resting': 'var(--uci-shadow-switch-resting)',
        'switch-hover': 'var(--uci-shadow-switch-hover)',
        'switch-focus': 'var(--uci-shadow-switch-focus)',
        'switch-thumb': 'var(--uci-shadow-switch-thumb)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}

