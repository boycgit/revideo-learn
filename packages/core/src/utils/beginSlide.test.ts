import {describe, expect, it, vi} from 'vitest';
import {beginSlide} from './beginSlide';
import {startScene, endScene} from './useScene';
import {startThread, endThread} from './useThread';

describe('beginSlide', () => {
  it('应该注册幻灯片并等待', () => {
    const mockRegister = vi.fn();
    const mockShouldWait = vi.fn().mockReturnValueOnce(true).mockReturnValue(false);
    
    const mockScene = {
      slides: {
        register: mockRegister,
        shouldWait: mockShouldWait,
      },
    } as any;

    const mockThread = {
      fixed: 100,
    } as any;

    startScene(mockScene);
    startThread(mockThread);

    const generator = beginSlide('test-slide');
    
    // 第一次 yield - 注册幻灯片
    let result = generator.next();
    expect(result.done).toBe(false);
    expect(mockRegister).toHaveBeenCalledWith('test-slide', 100);

    // 第二次 yield - 等待
    result = generator.next();
    expect(result.done).toBe(false);
    expect(mockShouldWait).toHaveBeenCalledWith('test-slide');

    // 第三次 - 完成
    result = generator.next();
    expect(result.done).toBe(true);

    endThread(mockThread);
    endScene(mockScene);
  });

  it('应该持续等待直到不需要等待', () => {
    const mockRegister = vi.fn();
    const mockShouldWait = vi
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);
    
    const mockScene = {
      slides: {
        register: mockRegister,
        shouldWait: mockShouldWait,
      },
    } as any;

    const mockThread = {
      fixed: 200,
    } as any;

    startScene(mockScene);
    startThread(mockThread);

    const generator = beginSlide('test-slide');
    
    generator.next(); // 注册
    generator.next(); // 第一次等待
    generator.next(); // 第二次等待
    generator.next(); // 第三次等待
    const result = generator.next(); // 完成

    expect(result.done).toBe(true);
    expect(mockShouldWait).toHaveBeenCalledTimes(4);

    endThread(mockThread);
    endScene(mockScene);
  });

  it('应该使用线程的 fixed 时间', () => {
    const mockRegister = vi.fn();
    const mockShouldWait = vi.fn().mockReturnValue(false);
    
    const mockScene = {
      slides: {
        register: mockRegister,
        shouldWait: mockShouldWait,
      },
    } as any;

    const mockThread = {
      fixed: 12345,
    } as any;

    startScene(mockScene);
    startThread(mockThread);

    const generator = beginSlide('my-slide');
    generator.next();

    expect(mockRegister).toHaveBeenCalledWith('my-slide', 12345);

    endThread(mockThread);
    endScene(mockScene);
  });
});
