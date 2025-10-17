import {describe, expect, it} from 'vitest';
import {Semaphore} from './Semaphore';

describe('Semaphore', () => {
  it('应该创建一个信号量', () => {
    const semaphore = new Semaphore();
    expect(semaphore).toBeDefined();
  });

  it('应该允许获取和释放', async () => {
    const semaphore = new Semaphore();
    await semaphore.acquire();
    semaphore.release();
  });

  it('应该阻塞直到释放', async () => {
    const semaphore = new Semaphore();
    const order: number[] = [];

    await semaphore.acquire();
    order.push(1);

    const promise = semaphore.acquire().then(() => {
      order.push(3);
    });

    order.push(2);
    semaphore.release();

    await promise;
    expect(order).toEqual([1, 2, 3]);
  });

  it('应该支持多次获取和释放', async () => {
    const semaphore = new Semaphore();

    await semaphore.acquire();
    semaphore.release();

    await semaphore.acquire();
    semaphore.release();

    await semaphore.acquire();
    semaphore.release();
  });
});
