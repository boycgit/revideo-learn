import {describe, expect, test} from 'vitest';
import {FlagDispatcher} from '../events';
import {DetailedError} from '../utils';
import {DependencyContext} from './DependencyContext';

class TestContext extends DependencyContext<void> {
  public beginCollecting() {
    super.startCollecting();
  }

  public endCollecting() {
    super.finishCollecting();
  }

  public tapDependency(dispatcher: FlagDispatcher) {
    this.dependencies.add(dispatcher.subscribable);
    dispatcher.subscribe(this.markDirty);
  }
}

describe('DependencyContext', () => {
  test('detects circular dependencies', () => {
    const ctx = new TestContext(undefined);
    ctx.beginCollecting();
    expect(() => ctx.beginCollecting()).toThrow(DetailedError);
    ctx.endCollecting();
  });

  test('collects and clears dependencies', () => {
    const source = new FlagDispatcher();
    const target = new TestContext(undefined);

    DependencyContext.collectionStack.push(target);
    target.tapDependency(source);
    DependencyContext.collectionStack.pop();

    expect(target['dependencies'].size).toBe(1);
    target['clearDependencies']();
    expect(target['dependencies'].size).toBe(0);
  });

  test('toPromise consumes promises sequentially', async () => {
    const ctx = new TestContext(undefined);
    const promise = Promise.resolve(5);
    const handle = DependencyContext.collectPromise(promise, 0);
    expect(handle.value).toBe(0);

    await ctx.toPromise();
    expect(handle.value).toBe(5);
  });
});
