import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  evolvePath,
  getLength,
  getPointAtLength,
  interpolatePath,
} from '@remotion/paths';

type FlowMode = 'fill' | 'eject' | 'none';

type Phase = {
  readonly n: number;
  readonly title: string;
  readonly subtitle: string;
  readonly duration: string;
  readonly accent: string;
  readonly atria: string;
  readonly ventricles: string;
  readonly avOpen: boolean;
  readonly slOpen: boolean;
  readonly pressure: string;
  readonly volume: string;
  readonly meaning: string;
  readonly flow: FlowMode;
  readonly flowSpeed: number;
  readonly volumeFrom: number;
  readonly volumeTo: number;
  readonly contractility: number;
};

const phases: Phase[] = [
  {
    n: 1,
    title: 'ATRIAL SYSTOLE',
    subtitle: 'Final 20–30% of ventricular filling',
    duration: '0.1 s',
    accent: '#ff45bc',
    atria: 'CONTRACTING',
    ventricles: 'RELAXED',
    avOpen: true,
    slOpen: false,
    pressure: 'Slight ↑',
    volume: 'Final 20–30% ↑',
    meaning: 'The atria contract and push the final portion of blood into the relaxed ventricles.',
    flow: 'fill',
    flowSpeed: 1.15,
    volumeFrom: 0.80,
    volumeTo: 1,
    contractility: 0,
  },
  {
    n: 2,
    title: 'ISOVOLUMETRIC CONTRACTION',
    subtitle: 'Pressure rises • ventricular volume unchanged',
    duration: '0.05–0.1 s',
    accent: '#ffb21e',
    atria: 'RELAXED / FILLING',
    ventricles: 'CONTRACTING',
    avOpen: false,
    slOpen: false,
    pressure: 'Rapid ↑↑',
    volume: 'Unchanged',
    meaning: 'The ventricles begin contracting with every valve closed, so pressure rises but no blood leaves.',
    flow: 'none',
    flowSpeed: 0,
    volumeFrom: 1,
    volumeTo: 1,
    contractility: 0.92,
  },
  {
    n: 3,
    title: 'RAPID EJECTION',
    subtitle: 'Blood leaves both ventricles rapidly',
    duration: '0.1 s',
    accent: '#2de19a',
    atria: 'RELAXED / FILLING',
    ventricles: 'CONTRACTING',
    avOpen: false,
    slOpen: true,
    pressure: 'High',
    volume: 'Rapid ↓',
    meaning: 'Ventricular pressure opens the aortic and pulmonary valves, producing rapid outflow into both arteries.',
    flow: 'eject',
    flowSpeed: 1.9,
    volumeFrom: 1,
    volumeTo: 0.42,
    contractility: 1,
  },
  {
    n: 4,
    title: 'REDUCED EJECTION',
    subtitle: 'Outflow continues at a slower rate',
    duration: '0.1 s',
    accent: '#75e169',
    atria: 'RELAXED / FILLING',
    ventricles: 'CONTRACTING (WEAKER)',
    avOpen: false,
    slOpen: true,
    pressure: 'Starts ↓',
    volume: 'Slow ↓',
    meaning: 'Ventricular force wanes, but semilunar valves remain open and the remaining blood is ejected more slowly.',
    flow: 'eject',
    flowSpeed: 0.78,
    volumeFrom: 0.42,
    volumeTo: 0.28,
    contractility: 0.68,
  },
  {
    n: 5,
    title: 'ISOVOLUMETRIC RELAXATION',
    subtitle: 'Pressure falls • ventricular volume unchanged',
    duration: '0.1 s',
    accent: '#4da4ff',
    atria: 'RELAXED / FILLING',
    ventricles: 'RELAXING',
    avOpen: false,
    slOpen: false,
    pressure: 'Rapid ↓↓',
    volume: 'Unchanged',
    meaning: 'The ventricles relax with every valve closed, so pressure falls quickly while end-systolic volume stays fixed.',
    flow: 'none',
    flowSpeed: 0,
    volumeFrom: 0.28,
    volumeTo: 0.28,
    contractility: 0.18,
  },
  {
    n: 6,
    title: 'RAPID FILLING',
    subtitle: 'Blood rushes from atria into ventricles',
    duration: '0.1 s',
    accent: '#3dc8ff',
    atria: 'RELAXED',
    ventricles: 'RELAXED',
    avOpen: true,
    slOpen: false,
    pressure: 'Low',
    volume: 'Rapid ↑',
    meaning: 'Ventricular pressure drops below atrial pressure, opening the AV valves and allowing rapid passive filling.',
    flow: 'fill',
    flowSpeed: 1.8,
    volumeFrom: 0.28,
    volumeTo: 0.72,
    contractility: 0,
  },
  {
    n: 7,
    title: 'REDUCED FILLING / DIASTASIS',
    subtitle: 'Slow passive filling before the next atrial systole',
    duration: '0.2–0.3 s',
    accent: '#8c5cff',
    atria: 'RELAXED',
    ventricles: 'RELAXED',
    avOpen: true,
    slOpen: false,
    pressure: 'Minimal change',
    volume: 'Slow ↑',
    meaning: 'Atrial and ventricular pressures nearly equalize, so passive filling slows until the next atrial contraction.',
    flow: 'fill',
    flowSpeed: 0.42,
    volumeFrom: 0.72,
    volumeTo: 0.80,
    contractility: 0,
  },
];

const INTRO_FRAMES = 90;
const PHASE_FRAMES = 210;
const RECAP_FRAMES = 240;

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));

const sceneOpacity = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 12, duration - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: [
      Easing.bezier(0.16, 1, 0.3, 1),
      Easing.linear,
      Easing.bezier(0.7, 0, 0.84, 0),
    ],
  });

const rightAtriumRelaxed =
  'M 150 252 C 170 192 255 176 312 222 C 342 247 344 307 318 357 C 292 408 211 412 166 373 C 128 340 126 289 150 252 Z';
const rightAtriumContracted =
  'M 169 260 C 187 211 250 198 294 233 C 318 252 320 301 299 340 C 278 381 218 385 183 355 C 154 331 150 290 169 260 Z';
const leftAtriumRelaxed =
  'M 444 224 C 494 178 584 188 617 248 C 644 298 620 369 568 394 C 516 420 449 390 434 336 C 421 286 426 244 444 224 Z';
const leftAtriumContracted =
  'M 463 238 C 505 200 574 207 601 257 C 623 299 604 354 562 374 C 519 394 466 370 454 326 C 444 286 449 255 463 238 Z';

const rightVentricleSmall =
  'M 198 421 C 234 396 306 402 342 443 C 372 479 366 585 323 649 C 297 687 253 676 224 635 C 192 591 168 472 198 421 Z';
const rightVentricleLarge =
  'M 171 388 C 216 355 307 365 354 416 C 400 466 399 620 338 706 C 303 756 240 735 199 676 C 153 611 129 454 171 388 Z';
const leftVentricleSmall =
  'M 441 417 C 476 389 554 392 590 439 C 625 486 603 603 555 666 C 526 704 484 692 459 648 C 430 596 414 453 441 417 Z';
const leftVentricleLarge =
  'M 418 385 C 462 350 558 354 606 415 C 655 478 630 644 564 732 C 524 785 459 759 426 697 C 386 622 374 428 418 385 Z';

const fillRightPath =
  'M 224 118 C 214 207 225 286 282 342 C 316 376 329 425 333 552';
const fillLeftPath =
  'M 650 260 C 604 262 571 277 548 311 C 519 355 500 405 494 557';
const ejectRightPath =
  'M 333 557 C 325 467 326 385 352 321 C 377 261 383 199 382 112';
const ejectLeftPath =
  'M 500 558 C 492 475 460 405 425 346 C 408 315 405 285 426 264 C 447 242 477 236 508 232 C 535 169 566 122 596 84';

const pathForFlow = (flow: FlowMode) => {
  if (flow === 'fill') {
    return [
      {d: fillRightPath, color: '#34c7ff'},
      {d: fillLeftPath, color: '#ff4d68'},
    ];
  }
  if (flow === 'eject') {
    return [
      {d: ejectRightPath, color: '#34c7ff'},
      {d: ejectLeftPath, color: '#ff4d55'},
    ];
  }
  return [];
};

const FlowStream: React.FC<{
  readonly path: string;
  readonly color: string;
  readonly frame: number;
  readonly speed: number;
}> = ({path, color, frame, speed}) => {
  const total = getLength(path);
  const cycle = ((frame * speed) / 54) % 1;
  const evolution = evolvePath(cycle, path);

  return (
    <>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.24}
        markerEnd={color === '#34c7ff' ? 'url(#blueArrow)' : 'url(#redArrow)'}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.72}
        strokeDasharray={evolution.strokeDasharray}
        strokeDashoffset={evolution.strokeDashoffset}
        filter="url(#flowGlow)"
      />
      {Array.from({length: 12}).map((_, index) => {
        const t = ((frame * speed) / 42 + index / 12) % 1;
        const point = getPointAtLength(path, total * t);
        const alpha = 0.28 + 0.72 * Math.sin(Math.PI * t);
        const radius = 4 + 4 * Math.sin(Math.PI * t);
        return (
          <g key={index} opacity={alpha}>
            <circle cx={point.x} cy={point.y} r={radius * 2.3} fill={color} opacity={0.12} />
            <circle cx={point.x} cy={point.y} r={radius} fill={color} />
            <circle
              cx={point.x - radius * 0.28}
              cy={point.y - radius * 0.3}
              r={radius * 0.28}
              fill="#fff"
              opacity={0.8}
            />
          </g>
        );
      })}
    </>
  );
};

const ValveLeaflets: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly open: boolean;
  readonly orientation: 'horizontal' | 'vertical';
  readonly label: string;
  readonly accent: string;
  readonly frame: number;
  readonly labelDy?: number;
}> = ({x, y, open, orientation, label, accent, frame, labelDy = 48}) => {
  const openAmount = open
    ? interpolate(frame, [0, 18], [0.15, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      })
    : interpolate(frame, [0, 15], [0.3, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });

  const stateColor = open ? '#24d98a' : '#ff4058';
  const half = 18;

  return (
    <g>
      <circle cx={x} cy={y} r={29} fill={stateColor} opacity={0.1} />
      <circle cx={x} cy={y} r={22} fill="#071321" stroke={stateColor} strokeWidth={3.5} />
      {orientation === 'horizontal' ? (
        <>
          <line
            x1={x - half}
            y1={y}
            x2={x - 2 - 11 * openAmount}
            y2={y + 15 * openAmount}
            stroke={stateColor}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          <line
            x1={x + half}
            y1={y}
            x2={x + 2 + 11 * openAmount}
            y2={y + 15 * openAmount}
            stroke={stateColor}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <line
            x1={x}
            y1={y - half}
            x2={x - 14 * openAmount}
            y2={y - 2 - 8 * openAmount}
            stroke={stateColor}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1={y + half}
            x2={x + 14 * openAmount}
            y2={y + 2 + 8 * openAmount}
            stroke={stateColor}
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        </>
      )}
      <text
        x={x}
        y={y + labelDy}
        textAnchor="middle"
        fill={accent}
        fontSize={14}
        fontWeight={900}
        letterSpacing={0.4}
      >
        {label}
      </text>
    </g>
  );
};

const HeartSvg: React.FC<{
  readonly phase: Phase;
  readonly frame: number;
  readonly duration: number;
}> = ({phase, frame, duration}) => {
  const progress = clamp(frame / Math.max(1, duration - 1));
  const volumeProgress = interpolate(
    progress,
    [0, 1],
    [phase.volumeFrom, phase.volumeTo],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing:
        phase.n === 3 || phase.n === 6
          ? Easing.bezier(0.16, 1, 0.3, 1)
          : Easing.bezier(0.42, 0, 0.58, 1),
    },
  );

  const atrialContraction =
    phase.n === 1 ? Math.sin(Math.PI * clamp(progress * 1.05)) : 0;

  const rightAtrium = interpolatePath(
    atrialContraction,
    rightAtriumRelaxed,
    rightAtriumContracted,
  );
  const leftAtrium = interpolatePath(
    atrialContraction,
    leftAtriumRelaxed,
    leftAtriumContracted,
  );
  const rightVentricle = interpolatePath(
    volumeProgress,
    rightVentricleSmall,
    rightVentricleLarge,
  );
  const leftVentricle = interpolatePath(
    volumeProgress,
    leftVentricleSmall,
    leftVentricleLarge,
  );

  const musclePulse =
    phase.contractility *
    (0.55 + 0.45 * Math.sin((frame / 30) * Math.PI * 2 * 1.15));
  const cavityStroke = 7 + musclePulse * 5;

  return (
    <svg viewBox="0 0 760 820" width="100%" height="100%" aria-label="Animated four chamber heart">
      <defs>
        <linearGradient id="myocardium" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9a83" />
          <stop offset="46%" stopColor="#e65850" />
          <stop offset="100%" stopColor="#8a2836" />
        </linearGradient>
        <radialGradient id="rightChamber" cx="45%" cy="38%" r="74%">
          <stop offset="0%" stopColor="#3973d7" />
          <stop offset="100%" stopColor="#142855" />
        </radialGradient>
        <radialGradient id="leftChamber" cx="45%" cy="38%" r="74%">
          <stop offset="0%" stopColor="#d24553" />
          <stop offset="100%" stopColor="#5c1b2d" />
        </radialGradient>
        <linearGradient id="venous" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#68d8ff" />
          <stop offset="100%" stopColor="#174aa2" />
        </linearGradient>
        <linearGradient id="arterial" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff9a7f" />
          <stop offset="100%" stopColor="#a62639" />
        </linearGradient>
        <filter id="phaseGlow">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="flowGlow">
          <feGaussianBlur stdDeviation="3.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="blueArrow" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 9 4 L 0 8 Z" fill="#34c7ff" />
        </marker>
        <marker id="redArrow" markerWidth="12" markerHeight="12" refX="9" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 9 4 L 0 8 Z" fill="#ff4d68" />
        </marker>
      </defs>

      <ellipse
        cx={380}
        cy={414}
        rx={300}
        ry={328}
        fill={phase.accent}
        opacity={0.055 + musclePulse * 0.055}
        filter="url(#phaseGlow)"
      />

      <path
        d="M 381 97 C 286 36 173 102 126 236 C 75 382 119 608 270 744 C 332 800 433 809 515 760 C 668 668 707 438 653 266 C 607 119 490 43 381 97 Z"
        fill="url(#myocardium)"
        stroke="#ffae98"
        strokeWidth={8}
      />

      {/* Great veins */}
      <path
        d="M 206 246 C 163 198 165 104 207 47 L 260 47 C 225 128 247 199 281 246 Z"
        fill="url(#venous)"
        stroke="#76d9ff"
        strokeWidth={6}
      />
      <path
        d="M 230 620 C 189 693 185 776 218 812 L 271 812 C 245 743 257 683 283 615 Z"
        fill="url(#venous)"
        stroke="#76d9ff"
        strokeWidth={6}
      />

      {/* Aorta */}
      <path
        d="M 423 195 C 404 105 432 44 490 23 C 561 -3 621 36 633 94 C 640 128 617 151 585 141 C 574 112 556 98 534 104 C 501 113 494 146 508 196 Z"
        fill="url(#arterial)"
        stroke="#ffa08b"
        strokeWidth={7}
      />

      {/* Pulmonary trunk */}
      <path
        d="M 352 199 C 334 116 349 66 402 49 C 453 33 498 65 505 111 C 510 142 491 164 465 162 C 447 131 427 120 404 128 C 378 138 374 168 384 203 Z"
        fill="url(#venous)"
        stroke="#76d9ff"
        strokeWidth={7}
      />

      {/* Pulmonary veins */}
      <path
        d="M 610 248 C 662 229 701 231 730 255 L 730 300 C 691 280 660 283 612 302 Z"
        fill="url(#arterial)"
        stroke="#ff9e88"
        strokeWidth={5}
      />
      <path
        d="M 604 319 C 657 310 693 321 724 349 L 724 389 C 687 363 655 361 604 369 Z"
        fill="url(#arterial)"
        stroke="#ff9e88"
        strokeWidth={5}
      />

      {/* Chamber glow emphasizes contraction without falsely changing isovolumetric volume */}
      <path
        d={rightVentricle}
        fill="none"
        stroke={phase.accent}
        strokeWidth={16 + musclePulse * 12}
        opacity={0.08 + musclePulse * 0.12}
        filter="url(#phaseGlow)"
      />
      <path
        d={leftVentricle}
        fill="none"
        stroke={phase.accent}
        strokeWidth={16 + musclePulse * 12}
        opacity={0.08 + musclePulse * 0.12}
        filter="url(#phaseGlow)"
      />

      {/* Chambers */}
      <path
        d={rightAtrium}
        fill="url(#rightChamber)"
        stroke="#f5aa9b"
        strokeWidth={7}
      />
      <path
        d={leftAtrium}
        fill="url(#leftChamber)"
        stroke="#f5aa9b"
        strokeWidth={7}
      />
      <path
        d={rightVentricle}
        fill="url(#rightChamber)"
        stroke="#ffb09c"
        strokeWidth={cavityStroke}
      />
      <path
        d={leftVentricle}
        fill="url(#leftChamber)"
        stroke="#ffb09c"
        strokeWidth={cavityStroke}
      />

      {/* Interventricular septum */}
      <path
        d="M 397 381 C 407 468 414 573 404 690"
        stroke="#ffc0ab"
        strokeWidth={18}
        strokeLinecap="round"
        opacity={0.92}
      />

      {/* Flow */}
      {pathForFlow(phase.flow).map((stream) => (
        <FlowStream
          key={stream.d}
          path={stream.d}
          color={stream.color}
          frame={frame}
          speed={phase.flowSpeed}
        />
      ))}

      {/* Named valves */}
      <ValveLeaflets
        x={335}
        y={386}
        open={phase.avOpen}
        orientation="horizontal"
        label="TRICUSPID"
        accent="#aeead1"
        frame={frame}
      />
      <ValveLeaflets
        x={492}
        y={386}
        open={phase.avOpen}
        orientation="horizontal"
        label="MITRAL"
        accent="#aeead1"
        frame={frame}
      />
      <ValveLeaflets
        x={380}
        y={242}
        open={phase.slOpen}
        orientation="vertical"
        label="PULMONARY"
        accent="#b9dfff"
        frame={frame}
        labelDy={-38}
      />
      <ValveLeaflets
        x={508}
        y={232}
        open={phase.slOpen}
        orientation="vertical"
        label="AORTIC"
        accent="#ffd0c8"
        frame={frame}
        labelDy={-38}
      />

      {/* Great-vessel labels: added after external visual review */}
      <g fontSize={15} fontWeight={900} letterSpacing={0.5}>
        <path d="M 183 88 L 214 126" stroke="#9de6ff" strokeWidth={2} opacity={0.9} />
        <text x={134} y={82} fill="#9de6ff">SVC</text>

        <path d="M 170 746 L 225 697" stroke="#9de6ff" strokeWidth={2} opacity={0.9} />
        <text x={126} y={762} fill="#9de6ff">IVC</text>

        <path d="M 318 88 L 385 120" stroke="#9de6ff" strokeWidth={2} opacity={0.9} />
        <text x={252} y={78} fill="#9de6ff">PULMONARY ARTERY</text>

        <path d="M 612 60 L 573 100" stroke="#ffc0b4" strokeWidth={2} opacity={0.9} />
        <text x={610} y={54} fill="#ffc0b4">AORTA</text>

        <path d="M 650 405 L 646 354" stroke="#ffc0b4" strokeWidth={2} opacity={0.9} />
        <text x={584} y={426} fill="#ffc0b4">PULMONARY VEINS</text>
      </g>

      {/* Chamber labels */}
      {[
        {x: 226, y: 289, label: 'RA'},
        {x: 537, y: 294, label: 'LA'},
        {x: 276, y: 572, label: 'RV'},
        {x: 522, y: 574, label: 'LV'},
      ].map((item) => (
        <text
          key={item.label}
          x={item.x}
          y={item.y}
          fill="#fff"
          textAnchor="middle"
          fontSize={34}
          fontWeight={900}
          style={{paintOrder: 'stroke', stroke: '#04101e', strokeWidth: 5}}
        >
          {item.label}
        </text>
      ))}
    </svg>
  );
};

const ValvePill: React.FC<{
  readonly label: string;
  readonly open: boolean;
}> = ({label, open}) => (
  <div
    style={{
      height: 62,
      borderRadius: 17,
      outline: '1px solid rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(5,16,29,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      fontSize: 19,
      fontWeight: 850,
      letterSpacing: 0.1,
    }}
  >
    <span>{label}</span>
    <span
      style={{
        minWidth: 91,
        textAlign: 'center',
        padding: '7px 10px',
        borderRadius: 11,
        backgroundColor: open ? '#17b974' : '#ee3c55',
        boxShadow: open
          ? '0 0 18px rgba(23,185,116,0.22)'
          : '0 0 18px rgba(238,60,85,0.22)',
        color: '#fff',
        fontSize: 17,
        fontWeight: 950,
      }}
    >
      {open ? 'OPEN' : 'CLOSED'}
    </span>
  </div>
);

const MetricCard: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly accent: string;
}> = ({label, value, accent}) => (
  <div
    style={{
      height: 108,
      borderRadius: 22,
      outline: '1px solid rgba(255,255,255,0.12)',
      backgroundColor: 'rgba(6,18,33,0.9)',
      padding: '17px 20px',
    }}
  >
    <div
      style={{
        color: '#8eacc3',
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: 0.55,
      }}
    >
      {label}
    </div>
    <div
      style={{
        color: accent,
        marginTop: 5,
        fontSize: 31,
        fontWeight: 950,
        lineHeight: 1.05,
      }}
    >
      {value}
    </div>
  </div>
);

const MeaningCard: React.FC<{
  readonly phase: Phase;
  readonly frame: number;
}> = ({phase, frame}) => (
  <div
    style={{
      height: 250,
      borderRadius: 26,
      outline: '1px solid rgba(76,203,255,0.26)',
      background:
        'linear-gradient(135deg, rgba(8,28,44,0.95), rgba(5,16,28,0.96))',
      padding: '23px 26px',
      opacity: interpolate(frame, [14, 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
      translate: interpolate(frame, [14, 30], ['0px 22px', '0px 0px'], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }),
    }}
  >
    <div
      style={{
        color: '#59d0ff',
        fontSize: 19,
        fontWeight: 950,
        letterSpacing: 1.2,
      }}
    >
      WHAT THIS MEANS
    </div>
    <div
      style={{
        color: '#fff',
        fontSize: 31,
        fontWeight: 950,
        marginTop: 9,
      }}
    >
      {phase.title
        .toLowerCase()
        .replace(/(^|\s|\/)([a-z])/g, (match) => match.toUpperCase())}
    </div>
    <div
      style={{
        color: '#dcecff',
        fontSize: 25,
        lineHeight: 1.42,
        fontWeight: 530,
        marginTop: 10,
        maxWidth: 900,
      }}
    >
      {phase.meaning}
    </div>
  </div>
);

const PhaseScene: React.FC<{readonly phase: Phase}> = ({phase}) => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const opacity = sceneOpacity(frame, PHASE_FRAMES);
  const progress = clamp(frame / Math.max(1, PHASE_FRAMES - 1));
  const titleSize = phase.title.length > 24 ? 38 : 46;

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          'radial-gradient(circle at 50% 22%, #173753 0%, #081521 50%, #02070d 100%)',
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '50px 52px 44px',
      }}
    >
      <div>
        <div
          style={{
            color: '#46c8ff',
            fontSize: 20,
            fontWeight: 950,
            letterSpacing: 5,
          }}
        >
          ORBIT MBBS
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 17,
            marginTop: 15,
          }}
        >
          <div
            style={{
              width: 78,
              height: 78,
              borderRadius: 42,
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
              backgroundColor: phase.accent,
              color: '#05111d',
              boxShadow: `0 0 34px ${phase.accent}66`,
              fontSize: 40,
              fontWeight: 1000,
              scale: interpolate(frame, [0, 18], [0.7, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.spring({damping: 180}),
                output: 'perceptual-scale',
              }),
            }}
          >
            {phase.n}
          </div>

          <div style={{flex: 1, minWidth: 0}}>
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 1.01,
                letterSpacing: -1.3,
                fontWeight: 1000,
              }}
            >
              {phase.title}
            </div>
            <div
              style={{
                color: '#aac7db',
                fontSize: 22,
                lineHeight: 1.2,
                fontWeight: 750,
                marginTop: 7,
              }}
            >
              {phase.subtitle}
            </div>
          </div>

          <div
            style={{
              flex: '0 0 auto',
              color: phase.accent,
              borderRadius: 17,
              outline: `2px solid ${phase.accent}`,
              padding: '10px 14px',
              fontSize: 23,
              fontWeight: 950,
            }}
          >
            {phase.duration}
          </div>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#17324a',
            marginTop: 21,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              borderRadius: 8,
              backgroundColor: phase.accent,
              boxShadow: `0 0 18px ${phase.accent}`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          height: 900,
          marginTop: 25,
          borderRadius: 40,
          overflow: 'hidden',
          outline: '1px solid rgba(255,255,255,0.13)',
          background:
            'linear-gradient(180deg, rgba(12,30,49,0.98), rgba(4,10,18,0.99))',
          boxShadow: '0 28px 86px rgba(0,0,0,0.42)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 40,
            right: 40,
            top: 10,
            bottom: 102,
          }}
        >
          <HeartSvg phase={phase} frame={frame} duration={PHASE_FRAMES} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 19,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 11,
          }}
        >
          <div
            style={{
              height: 72,
              borderRadius: 17,
              outline: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(2,8,15,0.78)',
              padding: '12px 17px',
            }}
          >
            <div style={{color: '#95b1c6', fontSize: 16, fontWeight: 900}}>
              ATRIA
            </div>
            <div
              style={{
                marginTop: 2,
                color:
                  phase.atria.includes('CONTRACTING') ? '#ff58c8' : '#e6f3fb',
                fontSize: phase.atria.length > 12 ? 22 : 26,
                fontWeight: 1000,
              }}
            >
              {phase.atria}
            </div>
          </div>
          <div
            style={{
              height: 72,
              borderRadius: 17,
              outline: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(2,8,15,0.78)',
              padding: '12px 17px',
            }}
          >
            <div style={{color: '#95b1c6', fontSize: 16, fontWeight: 900}}>
              VENTRICLES
            </div>
            <div
              style={{
                marginTop: 2,
                color:
                  phase.ventricles === 'RELAXED' ? '#e6f3fb' : '#51d2ff',
                fontSize: phase.ventricles.length > 14 ? 21 : 26,
                fontWeight: 1000,
              }}
            >
              {phase.ventricles}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 11,
          marginTop: 17,
        }}
      >
        <ValvePill label="Mitral valve" open={phase.avOpen} />
        <ValvePill label="Tricuspid valve" open={phase.avOpen} />
        <ValvePill label="Aortic valve" open={phase.slOpen} />
        <ValvePill label="Pulmonary valve" open={phase.slOpen} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginTop: 14,
        }}
      >
        <MetricCard
          label="VENTRICULAR PRESSURE"
          value={phase.pressure}
          accent={phase.accent}
        />
        <MetricCard
          label="VENTRICULAR VOLUME"
          value={phase.volume}
          accent={phase.accent}
        />
      </div>

      <div style={{marginTop: 15}}>
        <MeaningCard phase={phase} frame={frame} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 5,
          opacity: 0.4,
          background: `linear-gradient(90deg, ${phase.accent}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, INTRO_FRAMES);
  const phase = phases[7 - 1];

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          'radial-gradient(circle at 50% 30%, #1a3c5b 0%, #071522 54%, #02060b 100%)',
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '64px 52px 46px',
      }}
    >
      <div
        style={{
          color: '#46c8ff',
          fontSize: 21,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        ORBIT MBBS
      </div>

      <div
        style={{
          marginTop: 19,
          fontSize: 82,
          fontWeight: 1000,
          lineHeight: 0.91,
          letterSpacing: -3.2,
          opacity: interpolate(frame, [0, 22], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 22], ['0px 34px', '0px 0px'], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        THE
        <br />
        <span style={{color: '#ff5268'}}>CARDIAC</span>
        <br />
        CYCLE
      </div>

      <div
        style={{
          color: '#afcadd',
          marginTop: 25,
          fontSize: 27,
          fontWeight: 720,
        }}
      >
        One heartbeat • Seven mechanical phases
      </div>

      <div
        style={{
          position: 'absolute',
          width: 218,
          height: 218,
          right: 62,
          top: 112,
          borderRadius: 118,
          backgroundColor: 'rgba(3,10,18,0.72)',
          boxShadow: '0 0 44px rgba(54,199,255,0.24)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 118,
            border: '18px solid #36c7ff',
            borderTopColor: '#ff4fb8',
            borderRightColor: '#ff5368',
            rotate: interpolate(frame, [0, INTRO_FRAMES - 1], ['0deg', '28deg'], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />
        <div style={{textAlign: 'center', position: 'relative'}}>
          <div style={{fontSize: 50, lineHeight: 0.95, fontWeight: 1000}}>0.8</div>
          <div style={{fontSize: 22, marginTop: 6, fontWeight: 850}}>seconds</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 30,
          height: 1050,
          borderRadius: 42,
          outline: '1px solid rgba(255,255,255,0.13)',
          background:
            'linear-gradient(180deg, rgba(12,30,49,0.98), rgba(4,10,18,0.99))',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '35px 70px 80px 70px',
            scale: interpolate(frame, [0, INTRO_FRAMES - 1], [0.98, 1.02], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              output: 'perceptual-scale',
            }),
          }}
        >
          <HeartSvg phase={phase} frame={frame} duration={INTRO_FRAMES} />
        </div>

      </div>

      <div style={{display: 'flex', gap: 10, marginTop: 27}}>
        {phases.map((item, index) => (
          <div
            key={item.n}
            style={{
              flex: 1,
              height: 13,
              borderRadius: 8,
              backgroundColor: item.accent,
              opacity:
                0.65 +
                0.35 * Math.sin((frame + index * 4) / 12) ** 2,
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 30,
          color: '#d9ebf7',
          fontSize: 25,
          lineHeight: 1.4,
          fontWeight: 650,
          maxWidth: 900,
        }}
      >
        Watch the chambers, valves, blood flow, pressure and volume change together.
      </div>
    </AbsoluteFill>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, RECAP_FRAMES);

  return (
    <AbsoluteFill
      style={{
        opacity,
        background: 'linear-gradient(180deg, #081724, #02060b)',
        color: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '58px 52px 46px',
      }}
    >
      <div
        style={{
          color: '#46c8ff',
          fontSize: 20,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        ORBIT MBBS
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 1000,
          letterSpacing: -2,
          marginTop: 16,
        }}
      >
        ONE CARDIAC CYCLE
      </div>
      <div
        style={{
          color: '#a9c5d9',
          fontSize: 25,
          fontWeight: 700,
          marginTop: 6,
        }}
      >
        ≈ 0.8 seconds at a resting heart rate of 75 beats/min
      </div>

      <div style={{marginTop: 28, display: 'grid', gap: 11}}>
        {phases.map((phase, index) => {
          const appear = interpolate(frame, [index * 8, index * 8 + 22], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          });
          return (
            <div
              key={phase.n}
              style={{
                height: 142,
                borderRadius: 23,
                outline: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'rgba(9,24,40,0.92)',
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'hidden',
                opacity: appear,
                translate: `${(1 - appear) * 54}px 0px`,
              }}
            >
              <div
                style={{
                  width: 82,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: phase.accent,
                  color: '#05111d',
                  fontSize: 38,
                  fontWeight: 1000,
                }}
              >
                {phase.n}
              </div>
              <div style={{flex: 1, padding: '17px 20px'}}>
                <div style={{fontSize: 27, fontWeight: 950}}>{phase.title}</div>
                <div
                  style={{
                    color: '#9ebbd0',
                    fontSize: 20,
                    marginTop: 5,
                    lineHeight: 1.2,
                  }}
                >
                  {phase.subtitle}
                </div>
              </div>
              <div
                style={{
                  alignSelf: 'center',
                  color: phase.accent,
                  paddingRight: 22,
                  fontSize: 21,
                  fontWeight: 950,
                }}
              >
                {phase.duration}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <div
          style={{
            borderRadius: 22,
            outline: '1px solid rgba(255,91,111,0.25)',
            backgroundColor: 'rgba(45,16,24,0.8)',
            padding: '20px 22px',
          }}
        >
          <div style={{color: '#ff7187', fontSize: 18, fontWeight: 900}}>
            VENTRICULAR SYSTOLE
          </div>
          <div style={{fontSize: 34, fontWeight: 1000, marginTop: 5}}>≈ 0.3 s</div>
        </div>
        <div
          style={{
            borderRadius: 22,
            outline: '1px solid rgba(70,200,255,0.25)',
            backgroundColor: 'rgba(12,34,52,0.82)',
            padding: '20px 22px',
          }}
        >
          <div style={{color: '#59cfff', fontSize: 18, fontWeight: 900}}>
            VENTRICULAR DIASTOLE
          </div>
          <div style={{fontSize: 34, fontWeight: 1000, marginTop: 5}}>≈ 0.5 s</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CardiacCycleMaster: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={INTRO_FRAMES} premountFor={fps}>
        <Intro />
      </Sequence>

      <Sequence from={90} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[0]} />
      </Sequence>
      <Sequence from={300} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[1]} />
      </Sequence>
      <Sequence from={510} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[2]} />
      </Sequence>
      <Sequence from={720} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[3]} />
      </Sequence>
      <Sequence from={930} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[4]} />
      </Sequence>
      <Sequence from={1140} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[5]} />
      </Sequence>
      <Sequence from={1350} durationInFrames={PHASE_FRAMES} premountFor={fps}>
        <PhaseScene phase={phases[6]} />
      </Sequence>

      <Sequence from={1560} durationInFrames={RECAP_FRAMES} premountFor={fps}>
        <Recap />
      </Sequence>
    </AbsoluteFill>
  );
};
