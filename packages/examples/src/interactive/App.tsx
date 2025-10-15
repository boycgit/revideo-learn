import React, { useState, useEffect } from 'react';
import { Player } from '@revideo/player-react';
import type { Project } from '@revideo/core';
import './App.css';

import project from '../euclidean-algorithm'

interface Example {
  title: string;
  a: number;
  b: number;
  gcd: number;
}

const EXAMPLES: Example[] = [
  { title: '48 和 18', a: 48, b: 18, gcd: 6 },
  { title: '100 和 35', a: 100, b: 35, gcd: 5 },
  { title: '56 和 42', a: 56, b: 42, gcd: 14 },
  { title: '270 和 192', a: 270, b: 192, gcd: 6 },
];

export function App() {
  const [inputA, setInputA] = useState<number>(48);
  const [inputB, setInputB] = useState<number>(18);
  // const [project, setProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 加载项目
  useEffect(() => {
    loadProject(inputA, inputB);
  }, []);

  const loadProject = async (a: number, b: number) => {
    try {
      // 动态导入场景
      // const sceneModule = await import('../scenes/euclidean-algorithm');
      // const scene = sceneModule.default;
      
      // 使用 makeProject 创建新项目
      // const { makeProject } = await import('@revideo/core');
      // const newProject = makeProject({
      //   scenes: [scene],
      //   variables: {
      //     initialA: a,
      //     initialB: b,
      //   },
      // });
      
      // setProject(newProject);
      setCurrentTime(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('加载项目失败:', error);
    }
  };

  const handleStart = () => {
    // 验证输入
    if (isNaN(inputA) || isNaN(inputB) || inputA <= 0 || inputB <= 0) {
      alert('请输入有效的正整数！');
      return;
    }

    if (inputA > 1000 || inputB > 1000) {
      alert('数字过大，请输入小于 1000 的数字！');
      return;
    }

    // 重新加载项目
    loadProject(inputA, inputB);
    setIsPlaying(true);
  };

  const handleExampleClick = (example: Example) => {
    setInputA(example.a);
    setInputB(example.b);
    loadProject(example.a, example.b);
    setIsPlaying(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h1>欧几里得算法演示</h1>

        <div className="input-group">
          <label htmlFor="inputA">第一个数字 (A):</label>
          <input
            type="number"
            id="inputA"
            value={inputA}
            onChange={(e) => setInputA(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            min="1"
            max="1000"
          />
        </div>

        <div className="input-group">
          <label htmlFor="inputB">第二个数字 (B):</label>
          <input
            type="number"
            id="inputB"
            value={inputB}
            onChange={(e) => setInputB(parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            min="1"
            max="1000"
          />
        </div>

        <button className="start-btn" onClick={handleStart}>
          开始演示
        </button>

        <div className="examples">
          <h2>示例</h2>
          {EXAMPLES.map((example, index) => (
            <div
              key={index}
              className="example-item"
              onClick={() => handleExampleClick(example)}
            >
              <div className="title">{example.title}</div>
              <div className="desc">最大公约数: {example.gcd}</div>
            </div>
          ))}
        </div>

        <div className="info">
          <strong>使用说明：</strong>
          <br />
          1. 输入两个正整数
          <br />
          2. 点击"开始演示"按钮
          <br />
          3. 观看动画演示辗转相除法
          <br />
          4. 或点击示例快速加载
        </div>

        {duration > 0 && (
          <div className="playback-info">
            <div>
              时间: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </div>
            <div>状态: {isPlaying ? '播放中' : '已暂停'}</div>
          </div>
        )}
      </div>

      <div className="player-container">
        {project ? (
          <Player
            project={project}
            variables={{
              initialA: inputA,
              initialB: inputB,
            }}
            playing={isPlaying}
            currentTime={currentTime}
            looping={false}
            controls={true}
            quality={1}
            onTimeUpdate={setCurrentTime}
            onDurationChange={setDuration}
          />
        ) : (
          <div className="loading">加载中...</div>
        )}
      </div>
    </div>
  );
}
