import {vi} from 'vitest';
import 'vitest-webgl-canvas-mock';

vi.stubGlobal('DOMMatrix', class {});
