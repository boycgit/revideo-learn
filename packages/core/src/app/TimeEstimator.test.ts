import {beforeEach, describe, expect, test, vi} from 'vitest';
import {TimeEstimator} from './TimeEstimator';

describe('TimeEstimator', () => {
  let estimator: TimeEstimator;

  beforeEach(() => {
    estimator = new TimeEstimator();
    vi.restoreAllMocks();
  });

  test('estimate handles initial state with no progress', () => {
    const initial = estimator.estimate(1000);
    expect(initial).toEqual({completion: 0, elapsed: 1000, eta: Infinity});
  });

  test('update clamps completion and reflects in estimate', () => {
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    estimator.reset(0.5, 500);
    estimator.update(1.5, 1500);

    const estimate = estimator.estimate(2000);
    expect(estimate.completion).toBe(1);
    expect(estimate.eta).toBe(0);
    expect(estimate.elapsed).toBe(1500);
  });

  test('estimate uses last completion to compute eta', () => {
    estimator.reset(0, 0);
    estimator.update(0.5, 1000);
    const estimate = estimator.estimate(1500);
    expect(estimate.eta).toBeCloseTo(500);
  });

  test('estimate falls back to nextCompletion when no update occurred', () => {
    estimator.reset(0.25, 0);
    const estimate = estimator.estimate(1000);
    expect(estimate.eta).toBeCloseTo(3000);
  });

  test('reportProgress calls window.logProgress when available', () => {
    const logProgress = vi.fn();
    (window as any).logProgress = logProgress;
    estimator.update(0.4, 0);
    estimator.reportProgress();
    expect(logProgress).toHaveBeenCalledWith(0.4);
    delete (window as any).logProgress;
  });
});
