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
		lg: 'var(--radius)',
		md: 'calc(var(--radius) - 2px)',
		sm: 'calc(var(--radius) - 4px)'
    },
    colors: {
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			card: {
         DEFAULT: 'hsl(var(--card))',
         foreground: 'hsl(var(--card-foreground))'
			},
      popover: {
      DEFAULT: 'hsl(var(--popover))',
      foreground: 'hsl(var(--popover-foreground))'
    },
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))'
    },
    secondary: {
      DEFAULT: 'hsl(var(--secondary))',
      foreground: 'hsl(var(--secondary-foreground))'
    },
    muted: {
      DEFAULT: 'hsl(var(--muted))',
      foreground: 'hsl(var(--muted-foreground))'
    },
    accent: {
      DEFAULT: 'hsl(var(--accent))',
      foreground: 'hsl(var(--accent-foreground))'
    },
    destructive: {
      DEFAULT: 'hsl(var(--destructive))',
      foreground: 'hsl(var(--destructive-foreground))'
    },
    border: 'hsl(var(--border))',
    input: 'hsl(var(--input))',
    ring: 'hsl(var(--ring))',
    chart: {
      '1': 'hsl(var(--chart-1))',
      '2': 'hsl(var(--chart-2))',
      '3': 'hsl(var(--chart-3))',
      '4': 'hsl(var(--chart-4))',
      '5': 'hsl(var(--chart-5))'
    }
    },
    boxShadow: {
      'button-resting': 'var(--shadow-button-resting)',
      'button-hover': 'var(--shadow-button-hover)',
      'button-destructive-resting': 'var(--shadow-button-destructive-resting)',
      'button-destructive-hover': 'var(--shadow-button-destructive-hover)',
      'button-outlined-resting': 'var(--shadow-button-outlined-resting)',
      'button-outlined-hover': 'var(--shadow-button-outlined-hover)',
      'input-resting': 'var(--shadow-input-resting)',
      'input-hover': 'var(--shadow-input-hover)',
      'input-destructive-resting': 'var(--shadow-input-destructive-resting)',
      'input-destructive-hover': 'var(--shadow-input-destructive-hover)',
      'input-destructive-focus': 'var(--shadow-input-destructive-focus)',
      'checkbox-resting': 'var(--shadow-checkbox-resting)',
      'checkbox-hover': 'var(--shadow-checkbox-hover)',
      'switch-resting': 'var(--shadow-switch-resting)',
      'switch-hover': 'var(--shadow-switch-hover)',
      'switch-focus': 'var(--shadow-switch-focus)',
      'switch-thumb': 'var(--shadow-switch-thumb)'
    }

  },
  plugins: [require("tailwindcss-animate")]
  }
}
