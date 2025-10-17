import {describe, expect, it} from 'vitest';
import {createRef, makeRef, makeRefs} from './createRef';

describe('createRef', () => {
  it('应该创建一个引用', () => {
    const ref = createRef<string>();
    expect(ref).toBeDefined();
  });

  it('应该设置和获取值', () => {
    const ref = createRef<string>();
    ref('test value');
    expect(ref()).toBe('test value');
  });

  it('应该支持不同类型', () => {
    const numberRef = createRef<number>();
    numberRef(42);
    expect(numberRef()).toBe(42);

    const objectRef = createRef<{key: string}>();
    objectRef({key: 'value'});
    expect(objectRef()).toEqual({key: 'value'});
  });

  it('应该更新已存在的值', () => {
    const ref = createRef<string>();
    ref('first');
    expect(ref()).toBe('first');
    ref('second');
    expect(ref()).toBe('second');
  });
});

describe('makeRef', () => {
  it('应该创建对象属性的引用接收器', () => {
    const obj = {value: 'initial'};
    const receiver = makeRef(obj, 'value');

    receiver('updated');
    expect(obj.value).toBe('updated');
  });

  it('应该支持不同类型的属性', () => {
    const obj = {count: 0, name: 'test'};

    const countReceiver = makeRef(obj, 'count');
    countReceiver(42);
    expect(obj.count).toBe(42);

    const nameReceiver = makeRef(obj, 'name');
    nameReceiver('updated');
    expect(obj.name).toBe('updated');
  });
});

describe('makeRefs', () => {
  it('应该创建引用对象', () => {
    type TestComponent = (config: {refs?: {element: HTMLElement}}) => void;
    const refs = makeRefs<TestComponent>();
    expect(refs).toBeDefined();
    expect(typeof refs).toBe('object');
  });
});
