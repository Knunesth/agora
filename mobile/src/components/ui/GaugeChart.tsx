/**
 * Ágora — Gauge Chart (Medidor Semicircular de Risco)
 * Usa react-native-svg para renderizar o velocímetro de risco.
 */

import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

export type RiskLevel = 'low' | 'medium' | 'high';

interface GaugeChartProps {
  level: RiskLevel;
  size?: number;
}

const CX = 100;
const CY = 95;
const R = 78;

function pt(angleDeg: number, radius = R) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad), // minus: SVG y axis is inverted
  };
}

// Arc path going counter-clockwise in math (= clockwise in SVG, sweep=1)
// from startAngle to endAngle (both in math degrees: right=0°, top=90°, left=180°)
function arcPath(startAngle: number, endAngle: number) {
  const s = pt(startAngle);
  const e = pt(endAngle);
  const diff = Math.abs(startAngle - endAngle);
  const largeArc = diff > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)},${s.y.toFixed(2)} A ${R},${R},0,${largeArc},1,${e.x.toFixed(2)},${e.y.toFixed(2)}`;
}

// 3 sections of 60° each: green (180→120), yellow (120→60), red (60→0)
const GREEN_PATH  = arcPath(180, 120);
const YELLOW_PATH = arcPath(120, 60);
const RED_PATH    = arcPath(60, 0);

const NEEDLE_ANGLES: Record<RiskLevel, number> = {
  low: 165,
  medium: 90,
  high: 15,
};

export function GaugeChart({ level, size = 200 }: GaugeChartProps) {
  const needleAngle = NEEDLE_ANGLES[level];
  const needleTip = pt(needleAngle, 60);
  const svgHeight = Math.round(size * 0.55);

  return (
    <Svg width={size} height={svgHeight} viewBox="0 0 200 110">
      {}
      <Path
        d={arcPath(180, 0)}
        fill="none"
        stroke="#2A2A2A"
        strokeWidth={18}
        strokeLinecap="butt"
      />
      {}
      <Path d={GREEN_PATH}  fill="none" stroke="#00C853" strokeWidth={18} strokeLinecap="butt" />
      {}
      <Path d={YELLOW_PATH} fill="none" stroke="#FFD600" strokeWidth={18} strokeLinecap="butt" />
      {}
      <Path d={RED_PATH}    fill="none" stroke="#FF1744" strokeWidth={18} strokeLinecap="butt" />

      {}
      <Line
        x1={CX} y1={CY}
        x2={needleTip.x.toFixed(2)} y2={needleTip.y.toFixed(2)}
        stroke="#FFFFFF"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {}
      <Circle cx={CX} cy={CY} r={8}  fill="#1E1E1E" />
      <Circle cx={CX} cy={CY} r={5}  fill="#FFFFFF" />
    </Svg>
  );
}
