import {makeProject} from '@revideo/core';

import scene from './scenes/quick-sort';

export default makeProject({
  scenes: [scene],
  // 可选：通过变量自定义配置
  // variables: {
  //   arraySize: 20,
  //   minValue: 5,
  //   maxValue: 80,
  //   pivotStrategy: 'random',
  // },
});
