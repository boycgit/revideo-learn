import {describe, expect, it, vi} from 'vitest';
import {ValueDispatcher} from './ValueDispatcher';

describe('ValueDispatcher', () => {
  it('应该创建一个值调度器', () => {
    const dispatcher = new ValueDispatcher(0);
    expect(dispatcher).toBeDefined();
    expect(dispatcher.current).toBe(0);
  });

  it('应该在值改变时通知订阅者', () => {
    const dispatcher = new ValueDispatcher(0);
    const handler = vi.fn();

    dispatcher.subscribe(handler, false);
    dispatcher.current = 42;

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('应该立即通知新订阅者当前值', () => {
    const dispatcher = new ValueDispatcher(42);
    const handler = vi.fn();

    dispatcher.subscribe(handler);

    expect(handler).toHaveBeenCalledWith(42);
  });

  it('应该支持禁用立即通知', () => {
    const dispatcher = new ValueDispatcher(42);
    const handler = vi.fn();

    dispatcher.subscribe(handler, false);

    expect(handler).not.toHaveBeenCalled();
  });

  it('应该在每次值改变时通知', () => {
    const dispatcher = new ValueDispatcher(0);
    const handler = vi.fn();

    dispatcher.subscribe(handler, false);
    dispatcher.current = 1;
    dispatcher.current = 2;
    dispatcher.current = 3;

    expect(handler).toHaveBeenCalledTimes(3);
    expect(handler).toHaveBeenNthCalledWith(1, 1);
    expect(handler).toHaveBeenNthCalledWith(2, 2);
    expect(handler).toHaveBeenNthCalledWith(3, 3);
  });

  it('应该支持多个订阅者', () => {
    const dispatcher = new ValueDispatcher(0);
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    dispatcher.subscribe(handler1, false);
    dispatcher.subscribe(handler2, false);
    dispatcher.current = 42;

    expect(handler1).toHaveBeenCalledWith(42);
    expect(handler2).toHaveBeenCalledWith(42);
  });

  it('应该支持取消订阅', () => {
    const dispatcher = new ValueDispatcher(0);
    const handler = vi.fn();

    const unsubscribe = dispatcher.subscribe(handler, false);
    unsubscribe();
    dispatcher.current = 42;

    expect(handler).not.toHaveBeenCalled();
  });

  it('subscribable 应该提供当前值', () => {
    const dispatcher = new ValueDispatcher(42);
    expect(dispatcher.subscribable.current).toBe(42);
  });

  it('subscribable 应该支持订阅', () => {
    const dispatcher = new ValueDispatcher(0);
    const handler = vi.fn();

    dispatcher.subscribable.subscribe(handler, false);
    dispatcher.current = 42;

    expect(handler).toHaveBeenCalledWith(42);
  });
});
