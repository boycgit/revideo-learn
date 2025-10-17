import {describe, expect, it} from 'vitest';
import {capitalize} from './capitalize';

describe('capitalize', () => {
  it('应该将首字母大写', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('world')).toBe('World');
  });

  it('应该处理已经大写的字符串', () => {
    expect(capitalize('Hello')).toBe('Hello');
  });

  it('应该处理单字符字符串', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('z')).toBe('Z');
  });

  it('应该保持其余字符不变', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
    expect(capitalize('test123')).toBe('Test123');
  });
});
