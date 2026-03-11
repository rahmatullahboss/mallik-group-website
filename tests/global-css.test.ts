import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Global CSS', () => {
  let cssContent = '';

  beforeAll(() => {
    const cssPath = path.resolve(__dirname, '../src/styles/global.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  it('defines brand colors', () => {
    expect(cssContent).toContain('--color-primary: #0B3C5D;');
    expect(cssContent).toContain('--color-secondary: #C8A96A;');
  });

  it('defines base typography', () => {
    expect(cssContent).toContain('--font-heading: Poppins, sans-serif;');
    expect(cssContent).toContain('--font-body: Inter, sans-serif;');
  });

  it('defines typography scale (perfect fourth 1.333)', () => {
    // Testing the actual scale implementation
    expect(cssContent).toContain('--text-xs: 0.75rem;');
    expect(cssContent).toContain('--text-sm: 1rem;');
    expect(cssContent).toContain('--text-base: 1.333rem;');
    expect(cssContent).toContain('--text-lg: 1.777rem;');
    expect(cssContent).toContain('--text-xl: 2.369rem;');
    expect(cssContent).toContain('--text-2xl: 3.157rem;');
    expect(cssContent).toContain('--text-3xl: 4.209rem;');
    expect(cssContent).toContain('--text-4xl: 5.61rem;');
  });

  it('defines motion tokens', () => {
    expect(cssContent).toContain('--duration-instant: 100ms;');
    expect(cssContent).toContain('--duration-smooth: 300ms;');
    expect(cssContent).toContain('--duration-deliberate: 800ms;');
  });
});
