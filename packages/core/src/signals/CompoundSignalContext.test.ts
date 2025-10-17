import {describe, expect, it} from 'vitest';
import {CompoundSignalContext} from './CompoundSignalContext';
import {SignalContext} from './SignalContext';
import {map} from '../tweening/helpers';

describe('CompoundSignalContext', () => {
  it('应该创建复合信号', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    expect(signal()).toMatchObject({x: 10, y: 20});
  });

  it('应该支持子信号', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    expect(signal.x()).toBe(10);
    expect(signal.y()).toBe(20);
  });

  it('应该支持设置值', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    signal({x: 30, y: 40});
    expect(signal()).toMatchObject({x: 30, y: 40});
  });

  it('应该支持响应式值', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    const otherSignal = new SignalContext({x: 50, y: 60}, (from, to, v) => ({
      x: map(from.x, to.x, v),
      y: map(from.y, to.y, v),
    })).toSignal();

    signal(() => otherSignal());
    expect(signal()).toMatchObject({x: 50, y: 60});
  });

  it('reset 应该重置所有子信号', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    signal({x: 30, y: 40});
    signal.reset();
    expect(signal()).toMatchObject({x: 10, y: 20});
  });

  it('save 应该保存所有子信号', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    signal({x: 30, y: 40});
    signal.save(); // 保存当前值作为新的初始值
    expect(signal()).toMatchObject({x: 30, y: 40});
  });

  it('isInitial 应该检查所有子信号', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    expect(signal.isInitial()).toBe(true);
    
    signal({x: 30, y: 40});
    expect(signal.isInitial()).toBe(false);
  });

  it('raw 应该返回原始值', () => {
    const context = new CompoundSignalContext(
      ['x', 'y'],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    const raw = signal.context.raw();
    expect(raw).toMatchObject({x: 10, y: 20});
  });

  it('应该支持预定义的子信号', () => {
    const xSignal = new SignalContext(10, map).toSignal();
    const ySignal = new SignalContext(20, map).toSignal();

    const context = new CompoundSignalContext(
      [['x', xSignal], ['y', ySignal]],
      (value: any) => ({x: value.x ?? 0, y: value.y ?? 0}),
      {x: 10, y: 20},
      (from, to, value) => ({
        x: map(from.x, to.x, value),
        y: map(from.y, to.y, value),
      }),
    );

    const signal = context.toSignal();
    expect(signal.x()).toBe(10);
    expect(signal.y()).toBe(20);
  });
});
