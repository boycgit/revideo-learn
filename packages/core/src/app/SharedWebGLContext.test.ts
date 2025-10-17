import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {SharedWebGLContext, type WebGLContextOwner} from './SharedWebGLContext';

const originalCreateElement = document.createElement.bind(document);

interface StubGL extends WebGL2RenderingContext {
  setCompileSuccess(value: boolean): void;
  setLinkSuccess(value: boolean): void;
  loseContext: ReturnType<typeof vi.fn>;
  canvas: HTMLCanvasElement & {remove: ReturnType<typeof vi.fn>};
}

function createStubGL(): StubGL {
  let compileSuccess = true;
  let linkSuccess = true;
  const loseContext = vi.fn();
  const stub: Partial<StubGL> = {};
  const canvas = Object.assign(document.createElement('canvas'), {
    remove: vi.fn(),
    getContext: vi.fn(() => stub as unknown as WebGL2RenderingContext),
  });

  Object.assign(stub, {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    LINK_STATUS: 0x8b82,
    COMPILE_STATUS: 0x8b81,
    loseContext,
    canvas,
    canvas,
    createProgram: vi.fn(() => ({id: Symbol('program')} as any)),
    createShader: vi.fn(type => ({type} as any)),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn((_shader, param) =>
      param === stub.COMPILE_STATUS ? compileSuccess : true,
    ),
    getShaderInfoLog: vi.fn(() => 'ERROR: 0:1: compile error'),
    deleteShader: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn((_program, param) =>
      param === stub.LINK_STATUS ? linkSuccess : true,
    ),
    getProgramInfoLog: vi.fn(() => 'link failure'),
    deleteProgram: vi.fn(),
    useProgram: vi.fn(),
    getExtension: vi.fn(name => (name === 'WEBGL_lose_context' ? {loseContext} : null)),
    setCompileSuccess(value: boolean) {
      compileSuccess = value;
    },
    setLinkSuccess(value: boolean) {
      linkSuccess = value;
    },
  });

  return stub as StubGL;
}

describe('SharedWebGLContext', () => {
  let gl: StubGL;
  let logger: {error: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    vi.restoreAllMocks();
    gl = createStubGL();
    logger = {error: vi.fn()};
    vi.spyOn(document, 'createElement').mockImplementation(tag => {
      if (tag === 'canvas') {
        return gl.canvas;
      }
      return originalCreateElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('borrow reuses WebGL context and switches owners', () => {
    const context = new SharedWebGLContext(logger as any);
    const ownerA: WebGLContextOwner = {
      setup: vi.fn(),
      teardown: vi.fn(),
    };
    const ownerB: WebGLContextOwner = {
      setup: vi.fn(),
      teardown: vi.fn(),
    };

    const first = context.borrow(ownerA);
    expect(ownerA.setup).toHaveBeenCalledWith(gl);
    const second = context.borrow(ownerA);
    expect(second).toBe(first);
    expect(ownerA.setup).toHaveBeenCalledTimes(1);

    context.borrow(ownerB);
    expect(ownerA.teardown).toHaveBeenCalledWith(gl);
    expect(ownerB.setup).toHaveBeenCalledWith(gl);
  });

  test('getProgram compiles shaders and caches programs', () => {
    const context = new SharedWebGLContext(logger as any);
    const program = context.getProgram('fragment', 'vertex');
    expect(gl.createProgram).toHaveBeenCalled();
    expect(gl.attachShader).toHaveBeenCalledTimes(2);
    expect(program).toBeTruthy();

    const cached = context.getProgram('fragment', 'vertex');
    expect(cached).toBe(program);
    expect(gl.createProgram).toHaveBeenCalledTimes(1);
  });

  test('getProgram reports shader compilation errors', () => {
    const context = new SharedWebGLContext(logger as any);
    gl.setCompileSuccess(false);
    const program = context.getProgram('bad fragment', 'vertex');
    expect(program).toBeNull();
    expect(logger.error).toHaveBeenCalled();
    expect(gl.deleteShader).toHaveBeenCalled();
  });

  test('dispose tears down owner, deletes resources, and loses context', () => {
    const context = new SharedWebGLContext(logger as any);
    const owner: WebGLContextOwner = {setup: vi.fn(), teardown: vi.fn()};
    context.borrow(owner);
    context.getProgram('fragment', 'vertex');

    context.dispose();
    expect(owner.teardown).toHaveBeenCalledWith(gl);
    expect(gl.deleteProgram).toHaveBeenCalled();
    expect(gl.deleteShader).toHaveBeenCalled();
    expect(gl.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
    expect(gl.loseContext).toHaveBeenCalled();
    expect(gl.canvas.remove).toHaveBeenCalled();

    // Subsequent borrow initializes fresh context
    const newOwner: WebGLContextOwner = {setup: vi.fn(), teardown: vi.fn()};
    const newGl = context.borrow(newOwner);
    expect(newOwner.setup).toHaveBeenCalledWith(gl);
    expect(newGl).toBe(gl);
  });

  test('getProgram 应该处理链接错误', () => {
    const context = new SharedWebGLContext(logger as any);
    gl.setLinkSuccess(false);
    const program = context.getProgram('fragment', 'vertex');
    expect(program).toBeNull();
    expect(logger.error).toHaveBeenCalled();
    expect(gl.deleteProgram).toHaveBeenCalled();
  });

  test('应该处理没有 WEBGL_lose_context 扩展的情况', () => {
    const context = new SharedWebGLContext(logger as any);
    gl.getExtension = vi.fn(() => null);
    
    context.borrow({setup: vi.fn(), teardown: vi.fn()});
    context.dispose();
    
    expect(gl.canvas.remove).toHaveBeenCalled();
  });

  test('应该支持多次 borrow 和 dispose', () => {
    const context = new SharedWebGLContext(logger as any);
    const owner1 = {setup: vi.fn(), teardown: vi.fn()};
    const owner2 = {setup: vi.fn(), teardown: vi.fn()};
    
    context.borrow(owner1);
    context.dispose();
    
    context.borrow(owner2);
    expect(owner2.setup).toHaveBeenCalled();
  });
});
