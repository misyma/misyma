import { fontFamily as _fontFamily } from 'tailwindcss/defaultTheme';

import animation from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export const darkMode = ['class'];
export const content = [
	'./pages/**/*.{ts,tsx}',
	'./components/**/*.{ts,tsx}',
	'./app/**/*.{ts,tsx}',
	'./src/**/*.{ts,tsx}',
];
export const prefix = '';
export const theme = {
	container: {
		center: true,
		padding: '2rem',
		screens: {
			'2xl': '1400px',
			'4xl': '1920px',
		},
	},
	extend: {
		screens: {
			'4xl': '2000px',
		},
		colors: {
			status: {
				toRead: '#374151',
				inProgress: '#3ABEF7',
				finished: '#14B8A6',
			},
			periwinkle: {
				50: '#eef1ff',
				100: '#e0e6ff',
				200: '#c7d2fe',
				300: '#a5b6fc',
				400: '#8199f8',
				500: '#637ff1',
				600: '#4666e5',
				700: '#3855ca',
				800: '#3047a3',
				900: '#2e3f81',
				950: '#1b254b',
			},
			success: '#538c50',
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				DEFAULT: 'hsla(var(--primary))',
				foreground: 'hsla(var(--primary-foreground))',
			},
			primaryBackground: {
				DEFAULT: 'hsla(var(--primary-background))',
			},
			secondary: {
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))',
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))',
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))',
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))',
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))',
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))',
			},
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)',
		},
		width: {
			88: '22rem',
			104: '26rem',
		},
		keyframes: {
			wiggle: {
				'0%, 100%': { transform: 'rotate(-3deg)' },
				'50%': { transform: 'rotate(3deg)' },
			},
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--radix-accordion-content-height)' },
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)' },
				to: { height: '0' },
			},
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s ease-out',
			'accordion-up': 'accordion-up 0.2s ease-out',
		},
		fontFamily: {
			sans: ['"Montserrat"', ..._fontFamily.sans],
		},
	},
};

export const plugins = [animation];
