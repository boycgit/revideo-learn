import {describe, expect, it, vi} from 'vitest';
import {FlagDispatcher} from './FlagDispatcher';

describe('FlagDispatcher', () => {
  it('应该创建一个标志调度器', () => {
    const dispatcher = new FlagDispatcher();
    expect(dispatcher).toBeDefined();
    expect(dispatcher.isRaised()).toBe(false);
  });

  it('应该在 raise 时通知订阅者', () => {
    const dispatcher = new FlagDispatcher();
    const handler = vi.fn();

    dispatcher.subscribe(handler);
    expect(handler).not.toHaveBeenCalled();

    dispatcher.raise();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('应该只通知一次', () => {
    const dispatcher = new FlagDispatcher();
    const handler = vi.fn();

    dispatcher.subscribe(handler);
    dispatcher.raise();
    dispatcher.raise();
    dispatcher.raise();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('应该立即通知新订阅者如果标志已被设置', () => {
    const dispatcher = new FlagDispatcher();
    dispatcher.raise();

    const handler = vi.fn();
    dispatcher.subscribe(handler);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('应该在 reset 后允许再次 raise', () => {
    const dispatcher = new FlagDispatcher();
    const handler = vi.fn();

    dispatcher.subscribe(handler);
    dispatcher.raise();
    expect(handler).toHaveBeenCalledTimes(1);

    dispatcher.reset();
    expect(dispatcher.isRaised()).toBe(false);

    dispatcher.raise();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('应该支持多个订阅者', () => {
    const dispatcher = new FlagDispatcher();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    dispatcher.subscribe(handler1);
    dispatcher.subscribe(handler2);
    dispatcher.raise();

    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('应该支持取消订阅', () => {
    const dispatcher = new FlagDispatcher();
    const handler = vi.fn();

    const unsubscribe = dispatcher.subscribe(handler);
    unsubscribe();
    dispatcher.raise();

    expect(handler).not.toHaveBeenCalled();
  });
});
