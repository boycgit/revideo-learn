import {describe, expect, it} from 'vitest';
import {useThread, startThread, endThread} from './useThread';
import {Thread} from '../threading/Thread';

describe('useThread', () => {
  it('应该在没有上下文时抛出 DetailedError', () => {
    expect(() => useThread()).toThrow(
      'The thread is not available in the current context.',
    );
  });

  it('应该返回当前线程', () => {
    const thread = new Thread(
      function* () {
        yield;
      },
      null as any,
      null as any,
    );
    
    startThread(thread);
    const result = useThread();
    expect(result).toBe(thread);
    endThread(thread);
  });

  it('应该支持嵌套线程', () => {
    const thread1 = new Thread(
      function* () {
        yield;
      },
      null as any,
      null as any,
    );
    const thread2 = new Thread(
      function* () {
        yield;
      },
      null as any,
      null as any,
    );

    startThread(thread1);
    expect(useThread()).toBe(thread1);

    startThread(thread2);
    expect(useThread()).toBe(thread2);

    endThread(thread2);
    expect(useThread()).toBe(thread1);

    endThread(thread1);
  });

  it('应该在顺序错误时抛出错误', () => {
    const thread1 = new Thread(
      function* () {
        yield;
      },
      null as any,
      null as any,
    );
    const thread2 = new Thread(
      function* () {
        yield;
      },
      null as any,
      null as any,
    );

    startThread(thread1);
    startThread(thread2);

    let errorThrown = false;
    try {
      endThread(thread1);
    } catch (error: any) {
      errorThrown = true;
      expect(error.message).toContain('out of order');
    }

    expect(errorThrown).toBe(true);

    // 正确清理堆栈 - pop 已经在 endThread 中执行了
    endThread(thread1);
  });
});
