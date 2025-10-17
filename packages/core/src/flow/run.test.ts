import {describe, expect, test} from 'vitest';
import {run} from './run';
import {getTaskName} from './names';

const makeTask = () =>
  (function* () {
    yield 'step';
  })();

describe('run', () => {
  test('wraps generator factory without name', () => {
    const task = run(makeTask);

    expect(task.next().value).toBe('step');
    expect(getTaskName(task)).toBeNull();
  });

  test('wraps generator factory with explicit name', () => {
    const task = run('custom', makeTask);

    expect(task.next().value).toBe('step');
    expect(getTaskName(task)).toBe('custom');
  });
});
