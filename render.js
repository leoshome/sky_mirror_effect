/* 天空之鏡 — 繪製引擎
 * 純 Canvas 2D 運算，掛在 window.SkyMirror，不依賴任何外部資源。
 */
(function () {
  'use strict';

  var DEFAULTS = {
    horizon: 0.5,
    tilt: 0,
    compression: 0.97,
    ripple: 10,
    scale: 1.3,
    hue: 195,
    tint: 10,
    fade: 12,
    glint: 24,
    transparency: 0,
    style: 'natural',
    noiseAmt: 0,
    noiseScale: 1,
    noiseDir: 50,
    perspAmt: 0,
    perspNear: 50,
    perspStart: 100,
    perspCurve: 50,
    perspMax: 150,
    axis: 'h',
    side: 1
  };

  /* 只留兩個端點：最靜的近純鏡射（salt）與最密的碎波（pond）。
   * 水平線不屬於風格：切換時不帶 horizon。 */
  var PRESETS = [
    { id: 'salt', name: '鹽湖天空之鏡', values: { compression: 0.97, ripple: 10, scale: 1.3, hue: 195, tint: 10, fade: 12, glint: 24 } },
    { id: 'pond', name: '山泉池塘', values: { compression: 0.94, ripple: 70, scale: 0.75, hue: 205, tint: 16, fade: 14, glint: 40 } }
  ];

  var PREVIEW_MAX = 1400;
  var DEG = Math.PI / 180;

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  function num(v, fallback) {
    var n = Number(v);
    return isFinite(n) ? n : fallback;
  }

  /* 把參數正規化，避免 UI 傳來字串或非法值 */
  function normalize(state) {
    var s = state || {};
    return {
      horizon: clamp(num(s.horizon, DEFAULTS.horizon), 0, 1),
      tilt: clamp(num(s.tilt, DEFAULTS.tilt), -89, 89),
      compression: clamp(num(s.compression, DEFAULTS.compression), 0, 2),
      ripple: clamp(num(s.ripple, DEFAULTS.ripple), 0, 100),
      scale: clamp(num(s.scale, DEFAULTS.scale), 0.2, 3),
      hue: num(s.hue, DEFAULTS.hue),
      tint: clamp(num(s.tint, DEFAULTS.tint), 0, 100),
      fade: clamp(num(s.fade, DEFAULTS.fade), 0, 100),
      glint: clamp(num(s.glint, DEFAULTS.glint), 0, 100),
      transparency: clamp(num(s.transparency, DEFAULTS.transparency), 0, 100),
      /* 只剩兩種基底風格；未知值（含舊版本已移除的風格）一律降級為 natural */
      style: s.style === 'calm' ? 'calm' : 'natural',
      noiseAmt: clamp(num(s.noiseAmt, DEFAULTS.noiseAmt), 0, 100),
      noiseScale: clamp(num(s.noiseScale, DEFAULTS.noiseScale), 0.2, 3),
      noiseDir: clamp(num(s.noiseDir, DEFAULTS.noiseDir), 0, 100),
      perspAmt: clamp(num(s.perspAmt, DEFAULTS.perspAmt), 0, 100),
      perspNear: clamp(num(s.perspNear, DEFAULTS.perspNear), 0, 100),
      perspStart: clamp(num(s.perspStart, DEFAULTS.perspStart), 0, 100),
      perspCurve: clamp(num(s.perspCurve, DEFAULTS.perspCurve), 0, 100),
      perspMax: clamp(num(s.perspMax, DEFAULTS.perspMax), 100, 250),
      axis: s.axis === 'v' ? 'v' : 'h',
      side: num(s.side, 1) < 0 ? -1 : 1
    };
  }

  /* 快速正弦查表：預覽時每幀要算數百萬次，直接 Math.sin 會太慢 */
  var SIN_N = 4096;
  var SIN_TABLE = new Float32Array(SIN_N + 1);
  var TAU = Math.PI * 2;
  for (var si = 0; si <= SIN_N; si++) SIN_TABLE[si] = Math.sin(si / SIN_N * TAU);

  function fastSin(x) {
    var v = x / TAU;
    v -= Math.floor(v);
    var idx = v * SIN_N;
    var i0 = idx | 0;
    var f = idx - i0;
    return SIN_TABLE[i0] + (SIN_TABLE[i0 + 1] - SIN_TABLE[i0]) * f;
  }

  function fastCos(x) {
    return fastSin(x + Math.PI / 2);
  }

  function smoothstep(edge0, edge1, x) {
    var t = clamp((x - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);
    if (s === 0) {
      var g = Math.round(l * 255);
      return { r: g, g: g, b: g };
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hue(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return {
      r: Math.round(hue(h + 1 / 3) * 255),
      g: Math.round(hue(h) * 255),
      b: Math.round(hue(h - 1 / 3) * 255)
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: h * 360, s: s, l: l };
  }

  /* 水面幾何：水平線（axis h）或垂直線（axis v）。
   * 兩種模式都用「中心點 + 法線 + 切線」表示，反射與水波只依賴這組座標。 */
  function geometry(w, h, state) {
    var st = normalize(state);
    var theta = st.tilt * DEG;
    var sinT = Math.sin(theta);
    var cosT = Math.cos(theta);
    var slope = Math.tan(theta);
    var k = st.compression > 0 ? 1 + 1 / st.compression : 2;

    if (st.axis === 'v') {
      var centerX = st.horizon * w;
      var centerYv = h / 2;
      var side = st.side;
      var normalX = cosT * side;
      var normalY = sinT * side;
      return {
        axis: 'v',
        side: side,
        centerX: centerX,
        centerY: centerYv,
        normalX: normalX,
        normalY: normalY,
        tangentX: -sinT,
        tangentY: cosT,
        yL: 0,
        yR: 0,
        slope: slope,
        sinT: sinT,
        cosT: cosT,
        k: k,
        depthH: Math.max(1, side > 0 ? w - centerX : centerX)
      };
    }

    var centerY = st.horizon * h;
    return {
      axis: 'h',
      side: 1,
      centerX: w / 2,
      centerY: centerY,
      normalX: -sinT,
      normalY: cosT,
      tangentX: cosT,
      tangentY: sinT,
      yL: centerY - (w / 2) * slope,
      yR: centerY + (w / 2) * slope,
      slope: slope,
      sinT: sinT,
      cosT: cosT,
      k: k,
      depthH: Math.max(1, h - centerY)
    };
  }

  /* 水域像素 → 鏡像來源座標。
   * 水平模式：物理反射，倒影沿重力方向垂直翻轉（同欄取樣），
   * 不隨水面線傾斜水平偏移；垂直模式：沿法線壓縮／拉長。 */
  function reflectPoint(x, y, w, h, state) {
    var g = geometry(w, h, state);
    var st = normalize(state);
    var dx = x - g.centerX;
    var dy = y - g.centerY;
    var s = dx * g.normalX + dy * g.normalY;
    if (st.compression <= 0) return { s: s, x: x, y: y };
    if (g.axis === 'h') {
      var depth = dy - g.slope * dx;
      return { s: s, x: x, y: y - depth * g.k };
    }
    return {
      s: s,
      x: x - s * g.k * g.normalX,
      y: y - s * g.k * g.normalY
    };
  }

  /* 水面線（延伸為無限長）與畫面框 [0,w]×[0,h] 的兩個交點。
   * 陡角度時線從上／下邊離開畫面，覆蓋層的把手要放在交點上才抓得到。 */
  function lineSpan(w, h, state) {
    var g = geometry(w, h, state);
    var dirX = g.tangentX;
    var dirY = g.tangentY;
    var tMin = -Infinity;
    var tMax = Infinity;
    var t1, t2;

    if (Math.abs(dirX) > 1e-9) {
      t1 = (0 - g.centerX) / dirX;
      t2 = (w - g.centerX) / dirX;
      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));
    }
    if (Math.abs(dirY) > 1e-9) {
      t1 = (0 - g.centerY) / dirY;
      t2 = (h - g.centerY) / dirY;
      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));
    }
    /* 線中心必在框內，理論上 tMin < tMax；防呆 fallback */
    if (!(tMin < tMax)) {
      tMin = 0;
      tMax = 0;
    }

    return {
      ax: g.centerX + tMin * dirX,
      ay: g.centerY + tMin * dirY,
      bx: g.centerX + tMax * dirX,
      by: g.centerY + tMax * dirY
    };
  }

  /* 某一列「s ≥ 0」水域的 x 範圍（整數、[x0, x1)）；與 paintRows 的列掃描完全一致。
   * x0 ≥ x1 表示該列無水域。 */
  function rowSpan(g, y, w) {
    var dy = y - g.centerY;
    var sConst = g.normalY * dy - g.normalX * g.centerX;
    var xStart = 0;
    var xEnd = w;
    if (Math.abs(g.normalX) < 1e-6) {
      if (sConst < 0) return { x0: 0, x1: 0 };
    } else {
      var lim = -sConst / g.normalX;
      if (g.normalX > 0) {
        if (lim > 0) xStart = Math.ceil(lim);
      } else if (lim < w) {
        xEnd = Math.floor(lim);
      }
      if (xStart < 0) xStart = 0;
      if (xEnd > w) xEnd = w;
      if (xStart >= xEnd) return { x0: 0, x1: 0 };
    }
    return { x0: xStart, x1: xEnd };
  }

  /* 水面波場：五組方向波，波長只跟深度成正比，不做 1/depth 透視壓縮。
   * 舊版用 persp = 1/(dNorm + 0.075) 讓頻率在靠近水面線時爆走（可到上百個週期），
   * 那是細碎條紋／摩爾紋的來源；這裡改成深度線性，波紋密度全畫面一致。
   * 後兩組是高頻細波（fs 24 / 40），負責「山泉池塘」那種密集條紋；
   * nv 是垂直位移的權重——細波以垂直拉伸為主，粗波維持原本的橫向扭動。
   * s = 離水面線距離（px），uNorm = 沿水面 0..1，H = 水域最大深度（px）。
   * 回傳 dt／dn 是倒影取樣位移，glint 由波峰斜率產生的法線計算。 */
  var WAVES = [
    { fu: 1.6, fs: 5.5, amplitude: 0.36, nv: 0.35, phase: 0.0 },
    { fu: -2.4, fs: 9.0, amplitude: 0.24, nv: 0.40, phase: 1.7 },
    { fu: 3.6, fs: 14.0, amplitude: 0.16, nv: 0.55, phase: 4.1 },
    { fu: -5.2, fs: 24.0, amplitude: 0.14, nv: 0.85, phase: 2.9 },
    { fu: 7.4, fs: 40.0, amplitude: 0.10, nv: 1.10, phase: 0.6 }
  ];
  var WAVE_OUT = { amp: 0, dn: 0, dt: 0, blur: 0, glint: 0 };

  /* 深度透視增益：p = 1 − dn（0 前景、1 水面線）。
   * 近水面線 gain>1（變密）、前景 gain<1（拉寬）；雙向有界於 [1/C, C]。
   * perspAmt=0 → 恆為 1（逐位元等同無透視）。 */
  function perspGain(dn, st) {
    var amt = st.perspAmt / 100;
    if (amt <= 0) return 1;
    var C = Math.max(1, st.perspMax / 100);
    var k = st.perspNear / 100;
    var q = 0.5 + (st.perspCurve / 100) * 1.5;
    var dnC = clamp(dn, 0, 1);
    var p = 1 - dnC;
    /* perspStart：影響範圍邊界（100 = 整個水域）。邊界愈小，愈靠近前景的深度不受影響。 */
    var P0 = st.perspStart / 100;
    var fade = 1;
    if (P0 < 1) {
      fade = (P0 - dnC) / Math.max(1e-6, P0);
      if (fade < 0) fade = 0; else if (fade > 1) fade = 1;
    }
    var g = 1 + (C - 1) * amt * fade * ((1 - k) * Math.pow(p, q) - k * Math.pow(1 - p, q));
    var lo = 1 / C, hi = C;
    return g < lo ? lo : g > hi ? hi : g;
  }

  /* 噪聲位移：決定性的值噪聲 fBm（無 Math.random、無狀態 → 同輸入必同輸出）。
   * 兩組獨立場（不同 seed）分別驅動切線（dt）與法線（dn）位移，產生教學式正交交叉紋。 */
  var imul = Math.imul || function (a, b) { return (a * b) | 0; };
  function hash2(ix, iy, seed) {
    /* 整數雜湊（無 Math.sin，快很多）；決定性、無狀態。 */
    var h = imul(ix, 374761393) + imul(iy, 668265263) + imul(seed, 1442695041);
    h = imul(h ^ (h >>> 15), 2246822519);
    h = imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  /* 雙線性 + smoothstep 內插的值噪聲，回傳 [-1,1)。 */
  function valueNoise2(x, y, seed) {
    var x0 = Math.floor(x), y0 = Math.floor(y);
    var fx = x - x0, fy = y - y0;
    var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    var a = hash2(x0, y0, seed), b = hash2(x0 + 1, y0, seed);
    var c = hash2(x0, y0 + 1, seed), d = hash2(x0 + 1, y0 + 1, seed);
    var top = a + (b - a) * sx, bot = c + (d - c) * sx;
    return (top + (bot - top) * sy) * 2 - 1;
  }

  function fbm2(x, y, octaves, gain, seed) {
    var sum = 0, amp = 1, norm = 0, f = 1;
    for (var i = 0; i < octaves; i++) {
      sum += amp * valueNoise2(x * f, y * f, seed + i * 17);
      norm += amp; amp *= gain; f *= 2;
    }
    return sum / norm;
  }

  var NOISE_OUT = { dt: 0, dn: 0 };

  /* 回傳切線／法線位移 px（out 可傳入重用物件）。
   * 只保留三個有效旋鈕：noiseAmt（強度）、noiseScale（特徵尺度）、noiseDir（切線／法線配比）。
   * fBm 固定 2 層、增益 0.5、不旋轉、不做對比冪次、深度曲線用基底式——這些以前是另外
   * 5 個可調參數（noiseDetail／noiseGain／noiseAngle／noiseContrast／noiseDepth），
   * 因視覺差異不明顯而移除；固定值等同它們的中性預設，故外觀逐位元不變。 */
  function noiseOffset(uPx, vPx, dn, depthH, st, out) {
    var res = out || {};
    if (st.noiseAmt <= 0) { res.dt = 0; res.dn = 0; return res; }
    var period = Math.max(4, st.noiseScale * depthH * 0.05);
    var nx = fbm2(uPx / period, vPx / period, 2, 0.5, 0);
    var ny = fbm2(uPx / period, vPx / period, 2, 0.5, 101);
    var depthCurve = 0.010 + 0.030 * clamp(dn, 0, 1);
    var amp = (st.noiseAmt / 100) * depthH * depthCurve;
    var dirK = st.noiseDir / 100;
    res.dt = nx * (1 - dirK) * amp;
    res.dn = ny * dirK * amp;
    return res;
  }

  function waveSampleNorm(s, uNorm, H, st, out) {
    var result = out || {};
    var depthH = Math.max(1, H);
    var dNorm = clamp(s / depthH, 0, 1);
    var rippleK = st.ripple / 100;
    /* 振幅以水域深度為單位：預覽與匯出同比例；近水面線幾乎平，前景才明顯。 */
    var amp = rippleK * depthH * (0.010 + 0.030 * dNorm);
    var invScale = 1 / Math.max(0.2, st.scale);
    var persp = perspGain(dNorm, st);
    var dtSum = 0;
    var dnSum = 0;
    var slopeU = 0;
    var slopeS = 0;

    for (var i = 0; i < WAVES.length; i++) {
      var wv = WAVES[i];
      var fu = wv.fu * invScale;
      var fs = wv.fs * invScale * persp;
      var phase = TAU * (fs * dNorm + fu * uNorm) + wv.phase;
      var sn = fastSin(phase);
      var cs = fastCos(phase);
      var a = sn * wv.amplitude;
      dtSum += a;
      dnSum += a * wv.nv;
      /* 斜率換算成「px 高度 / px 距離」，所以數值與解析度無關。 */
      var slopeK = wv.amplitude * TAU * amp / depthH;
      slopeU += cs * slopeK * fu;
      slopeS += cs * slopeK * fs;
    }

    /* 波高直接當水平位移；細波再疊上較強的垂直分量，倒影才會斷成細條。 */
    var dt = dtSum * amp;
    var dn = dnSum * amp;

    /* 波峰斜率 → 法線。高頻波疊起來斜率會很大，先做柔性飽和再正規化，
     * 否則法線會躺平、波光變成一片雜訊。 */
    var gx = slopeU * 2.0;
    var gy = slopeS * 2.0;
    gx = gx / (1 + 0.55 * Math.abs(gx));
    gy = gy / (1 + 0.55 * Math.abs(gy));
    var nx = -gx;
    var ny = -gy;
    var nz = 1;
    var nInv = 1 / Math.sqrt(nx * nx + ny * ny + 1);
    nx *= nInv;
    ny *= nInv;
    nz *= nInv;

    /* 近水面線的視線最斜，波光集中在那一帶。 */
    var viewY = (1 - dNorm) * 6;
    var vLen = Math.sqrt(viewY * viewY + 1);
    var vy = viewY / vLen;
    var vz = 1 / vLen;

    /* 稀疏波光：只有反射方向對準光源時才亮。 */
    var lx = -0.35;
    var ly = -0.55;
    var lz = 0.76;
    var dotIN = -vy * ny - vz * nz;
    var rx = -2 * dotIN * nx;
    var ry = -vy - 2 * dotIN * ny;
    var rz = -vz - 2 * dotIN * nz;
    var dotRL = clamp(rx * lx + ry * ly + rz * lz, 0, 1);
    var rl2 = dotRL * dotRL;
    var rl4 = rl2 * rl2;
    var rl8 = rl4 * rl4;
    var rl16 = rl8 * rl8;
    var rl32 = rl16 * rl16;
    var rl48 = rl32 * rl16;
    var glintK = st.glint / 100;
    /* 只有斜面才反光：ripple = 0 時不會整片泛白。
     * rl48 是稀疏的亮核，rl8 給一圈柔光，兩者相加才不會只剩孤立雜點。 */
    var tilt = clamp(Math.sqrt(slopeU * slopeU + slopeS * slopeS) * 3.0, 0, 1);
    var spec = (rl48 * 1.4 + rl8 * 0.9) * glintK * tilt;

    result.amp = amp;
    result.dn = dn;
    result.dt = dt;
    /* 固定輕微柔化（不是可調的景深）：純鏡面零模糊會像玻璃而不是水。 */
    result.blur = (0.35 + 2.0 * dNorm) * (depthH / 480);
    result.glint = spec;
    return result;
  }

  function waveSample(s, uNorm, H, state) {
    return waveSampleNorm(s, uNorm, H, normalize(state));
  }

  /* calm（rockimg 式）水波：每列沿切線的純正弦位移。
   * 振幅隨深度展開、波長隨深度變長；座標與波列一致（以 depthH 為單位）。
   * 回傳 {dt: 沿切線位移 px, amp: 該深度振幅}；out 可傳入重用物件。 */
  function calmOffset(s, depthH, st, out) {
    var result = out || {};
    var depthH1 = Math.max(1, depthH);
    var dn = clamp(s / depthH1, 0, 1);
    var amp = (st.ripple / 100) * depthH1 * (0.014 + 0.044 * Math.pow(dn, 1.3));
    var lam = depthH1 * (0.216 + 0.278 * dn) * st.scale / perspGain(dn, st);
    result.dt = amp * Math.sin(TAU * s / lam + 1.3);
    result.amp = amp;
    return result;
  }

  /* 舊測試用的相容包裝：回傳沿切線／法線的位移 */
  function rippleOffset(d, H, state) {
    if (!(H > 0) || d <= 0) return { dx: 0, dy: 0 };
    var wv = waveSample(d, 0.5, H, state);
    return { dx: wv.dt, dy: wv.dn };
  }

  function measureExport(srcW, srcH, longSide) {
    srcW = Math.max(1, Math.round(srcW));
    srcH = Math.max(1, Math.round(srcH));
    if (longSide == null) return { width: srcW, height: srcH };
    var target = Math.round(longSide);
    if (!(target > 0) || target >= Math.max(srcW, srcH)) {
      return { width: srcW, height: srcH };
    }
    var ratio = target / Math.max(srcW, srcH);
    return {
      width: Math.max(1, Math.round(srcW * ratio)),
      height: Math.max(1, Math.round(srcH * ratio))
    };
  }

  /* 共用暫存畫布，避免每次配置 */
  var scratch = null;
  function scratchCtx(w, h) {
    if (!scratch) scratch = document.createElement('canvas');
    if (scratch.width !== w || scratch.height !== h) {
      scratch.width = w;
      scratch.height = h;
    }
    var ctx = scratch.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }

  /* 只取來源的指定區域，縮放到 w×h（匯出裁切用） */
  function buildCropData(source, sx, sy, sw, sh, w, h) {
    var ctx = scratchCtx(w, h);
    ctx.drawImage(source, sx, sy, sw, sh, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  function buildSourceData(source, w, h) {
    return buildCropData(source, 0, 0, source.width || source.naturalWidth, source.height || source.naturalHeight, w, h);
  }

  function foldCoord(v, max) {
    if (max <= 0) return 0;
    var period = max * 2;
    v = v % period;
    if (v < 0) v += period;
    return v > max ? period - v : v;
  }

  var SAMPLE0 = new Float32Array(4);
  var SAMPLE1 = new Float32Array(4);
  var SAMPLE2 = new Float32Array(4);

  function sampleBilinear(src, w, h, x, y, out4) {
    var maxX = w - 1;
    var maxY = h - 1;
    x = x < 0 ? 0 : x > maxX ? maxX : x;
    y = y < 0 ? 0 : y > maxY ? maxY : y;
    var x0 = x | 0;
    var y0 = y | 0;
    var fx = x - x0;
    var fy = y - y0;
    var x1 = x0 < maxX ? x0 + 1 : x0;
    var y1 = y0 < maxY ? y0 + 1 : y0;
    var i00 = (y0 * w + x0) << 2;
    var i10 = (y0 * w + x1) << 2;
    var i01 = (y1 * w + x0) << 2;
    var i11 = (y1 * w + x1) << 2;
    var w00 = (1 - fx) * (1 - fy);
    var w10 = fx * (1 - fy);
    var w01 = (1 - fx) * fy;
    var w11 = fx * fy;
    out4[0] = src[i00] * w00 + src[i10] * w10 + src[i01] * w01 + src[i11] * w11;
    out4[1] = src[i00 + 1] * w00 + src[i10 + 1] * w10 + src[i01 + 1] * w01 + src[i11 + 1] * w11;
    out4[2] = src[i00 + 2] * w00 + src[i10 + 2] * w10 + src[i01 + 2] * w01 + src[i11 + 2] * w11;
    out4[3] = 255;
  }

  function sampleSource(src, w, h, axis, x, y, out4) {
    if (axis === 'v') x = foldCoord(x, w - 1);
    else y = foldCoord(y, h - 1);
    sampleBilinear(src, w, h, x, y, out4);
  }

  /* 核心：把 sourceImageData 的水面區域重繪成倒影，寫進 out（Uint8ClampedArray） */
  function paintRows(src, out, w, h, state, startY, endY) {
    var st = normalize(state);
    var g = geometry(w, h, st);
    var nX = g.normalX;
    var nY = g.normalY;
    var tX = g.tangentX;
    var tY = g.tangentY;
    var cx = g.centerX;
    var cy = g.centerY;
    var slope = g.slope;
    var depthH = g.depthH;
    var k = g.k;
    var axis = g.axis;
    var along = axis === 'v' ? h : w;
    var blendLen = Math.max(2, depthH * 0.03);

    var wc = hslToRgb(st.hue, 0.45, 0.32);
    var waterDark = hslToRgb(st.hue, 0.30, 0.16);
    var waterMid = hslToRgb(st.hue, 0.36, 0.24);
    var targetLum = Math.max(1, 0.299 * wc.r + 0.587 * wc.g + 0.114 * wc.b);
    var tintK = st.tint / 100 * 0.75;
    var invTint = 1 - tintK;
    var fadeK = st.fade / 100;
    var wr = wc.r / targetLum, wg = wc.g / targetLum, wb = wc.b / targetLum;
    var noReflect = st.compression <= 0.0001;
    var opacity = 1 - st.transparency / 100;
    var isCalm = st.style === 'calm';

    var yStart = Math.max(0, startY);
    var yEnd = Math.min(h, endY);
    if (yStart >= yEnd) return;

    for (var y = yStart; y < yEnd; y++) {
      var dy = y - cy;
      /* s(x) = nX*(x-cx) + nY*dy；這一列要處理的 x 範圍由 rowSpan 統一計算 */
      var span = rowSpan(g, y, w);
      if (span.x0 >= span.x1) continue;
      var xStart = span.x0;
      var xEnd = span.x1;

      var o = (y * w + xStart) * 4;
      for (var x = xStart; x < xEnd; x++, o += 4) {
        var dx = x - cx;
        var s = nX * dx + nY * dy;
        if (s < 0) s = 0;
        var dNorm = clamp(s / depthH, 0, 1);
        var blend = smoothstep(0, blendLen, s);
        var r, gg, b;

        if (noReflect) {
          var q = Math.pow(dNorm, 0.6);
          r = wc.r + (waterDark.r - wc.r) * q;
          gg = wc.g + (waterDark.g - wc.g) * q;
          b = wc.b + (waterDark.b - wc.b) * q;
        } else {
          var uNorm = (tX * dx + tY * dy) / along + 0.5;
          var wv;
          if (isCalm) {
            /* calm：每列沿切線的純正弦位移，無垂直分量、無波光 */
            calmOffset(s, depthH, st, WAVE_OUT);
            WAVE_OUT.dn = 0;
            WAVE_OUT.blur = (0.35 + 2.0 * dNorm) * (depthH / 480);
            WAVE_OUT.glint = 0;
            wv = WAVE_OUT;
          } else {
            wv = waveSampleNorm(s, uNorm, depthH, st, WAVE_OUT);
          }
          if (st.noiseAmt > 0) {
            var uPx = tX * dx + tY * dy;   /* 沿水面的像素座標 */
            noiseOffset(uPx, s, dNorm, depthH, st, NOISE_OUT);
            wv.dt += NOISE_OUT.dt;
            wv.dn += NOISE_OUT.dn;
          }
          var srcX, srcY;
          if (axis === 'h') {
            /* 物理反射：對該欄局部水面線高度垂直翻轉，倒影不隨傾斜水平偏移 */
            var depth = dy - slope * dx;
            srcX = x + wv.dn * nX + wv.dt * tX;
            srcY = y - depth * k + wv.dn * nY + wv.dt * tY;
          } else {
            srcX = x - s * k * nX + wv.dn * nX + wv.dt * tX;
            srcY = y - s * k * nY + wv.dn * nY + wv.dt * tY;
          }

          sampleSource(src, w, h, axis, srcX, srcY, SAMPLE0);
          var blur = wv.blur;
          if (blur > 0.05) {
            sampleSource(src, w, h, axis, srcX - blur * tX, srcY - blur * tY, SAMPLE1);
            sampleSource(src, w, h, axis, srcX + blur * tX, srcY + blur * tY, SAMPLE2);
            r = SAMPLE0[0] * 0.52 + SAMPLE1[0] * 0.24 + SAMPLE2[0] * 0.24;
            gg = SAMPLE0[1] * 0.52 + SAMPLE1[1] * 0.24 + SAMPLE2[1] * 0.24;
            b = SAMPLE0[2] * 0.52 + SAMPLE1[2] * 0.24 + SAMPLE2[2] * 0.24;
          } else {
            r = SAMPLE0[0];
            gg = SAMPLE0[1];
            b = SAMPLE0[2];
          }

          if (isCalm) {
            /* calm 水色：與水色基底的線性混合（不做 natural 的乘性染色） */
            var cbR = wc.r + (waterDark.r - wc.r) * dNorm;
            var cbG = wc.g + (waterDark.g - wc.g) * dNorm;
            var cbB = wc.b + (waterDark.b - wc.b) * dNorm;
            r = r * (1 - tintK) + cbR * tintK;
            gg = gg * (1 - tintK) + cbG * tintK;
            b = b * (1 - tintK) + cbB * tintK;
          } else if (tintK > 0) {
            r = r * invTint + clamp(r * wr, 0, 255) * tintK;
            gg = gg * invTint + clamp(gg * wg, 0, 255) * tintK;
            b = b * invTint + clamp(b * wb, 0, 255) * tintK;
          }

          var fadeF = fadeK * dNorm * Math.sqrt(dNorm);
          if (fadeF > 0) {
            var invF = 1 - fadeF;
            var cK = 0.35 * fadeF;
            var invC = 1 - cK;
            r = (r * invF + waterDark.r * fadeF) * invC + 128 * cK;
            gg = (gg * invF + waterDark.g * fadeF) * invC + 128 * cK;
            b = (b * invF + waterDark.b * fadeF) * invC + 128 * cK;
          }

          /* 水色混合：仍是「遠處反射強、近處水色多」，但改用固定曲線。
           * Fresnel（法線項）已移除，避免高頻法線把水色打成直條紋。
           * calm 不走這條曲線——水色已由上方線性基底混合負責。 */
          if (!isCalm) {
            var reflK = 0.80 + 0.14 * (1 - dNorm);
            r = r * reflK + waterMid.r * (1 - reflK);
            gg = gg * reflK + waterMid.g * (1 - reflK);
            b = b * reflK + waterMid.b * (1 - reflK);
          }

          if (wv.glint > 0) {
            /* 波光只出現在「本身夠亮」的倒影上（天空、太陽），
             * 否則暗部建築也會冒出亮點，看起來像雜訊。 */
            var lum = (r * 0.299 + gg * 0.587 + b * 0.114) / 255;
            var gl = Math.min(0.95, wv.glint * lum * lum * 2.6) * 0.9;
            r += (255 - r) * gl;
            gg += (255 - gg) * gl;
            b += (255 - b) * gl;
          }
        }

        var bMix = blend * opacity;
        var invB = 1 - bMix;
        out[o] = src[o] * invB + r * bMix;
        out[o + 1] = src[o + 1] * invB + gg * bMix;
        out[o + 2] = src[o + 2] * invB + b * bMix;
        out[o + 3] = 255;
      }
    }
  }

  function getPreviewSource(canvas, source, w, h) {
    var cache = canvas.__smCache;
    if (cache && cache.source === source && cache.w === w && cache.h === h) {
      return cache.data;
    }
    var data = buildSourceData(source, w, h);
    canvas.__smCache = { source: source, w: w, h: h, data: data };
    return data;
  }

  function renderPreview(canvas, source, state, options) {
    if (!canvas || !source) return;
    var cssW = canvas.clientWidth || canvas.parentElement && canvas.parentElement.clientWidth || 0;
    var cssH = canvas.clientHeight || canvas.parentElement && canvas.parentElement.clientHeight || 0;
    if (!cssW || !cssH) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(cssW * dpr));
    var h = Math.max(1, Math.round(cssH * dpr));
    var scale = Math.min(1, PREVIEW_MAX / Math.max(w, h));
    if (scale < 1) {
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
    }
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    var ctx = canvas.getContext('2d');
    if (options && options.plain) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(source, 0, 0, w, h);
      return;
    }
    var srcData = getPreviewSource(canvas, source, w, h);
    var out = ctx.createImageData(w, h);
    out.data.set(srcData.data);
    var stN = normalize(state);
    paintRows(srcData.data, out.data, w, h, stN, 0, h);
    ctx.putImageData(out, 0, 0);
  }

  /* 將完整影像（不裁切）渲染到指定尺寸。裁切匯出會先用這個函式畫出完整畫面，
     再把裁切範圍取出來；這樣倒影取樣才不會被裁切邊界截斷。 */
  async function renderFullToCanvas(canvas, source, state, outW, outH, options) {
    outW = Math.max(1, Math.round(outW));
    outH = Math.max(1, Math.round(outH));
    canvas.width = outW;
    canvas.height = outH;
    var ctx = canvas.getContext('2d');
    var st = normalize(state);

    var srcData = buildSourceData(source, outW, outH);
    var out = ctx.createImageData(outW, outH);
    out.data.set(srcData.data);

    var g = geometry(outW, outH, st);
    var startY = Math.max(0, Math.floor(Math.min(g.yL, g.yR)));
    var total = Math.max(1, outH - startY);
    var done = 0;
    var CHUNK = 128;

    for (var y = startY; y < outH; y += CHUNK) {
      if (options.signal && options.signal.aborted) {
        return { aborted: true, width: outW, height: outH };
      }
      var end = Math.min(y + CHUNK, outH);
      paintRows(srcData.data, out.data, outW, outH, st, y, end);
      done += end - y;
      if (options.onProgress) options.onProgress(done, total);
      await new Promise(function (resolve) { setTimeout(resolve, 0); });
    }

    ctx.putImageData(out, 0, 0);
    return { width: outW, height: outH };
  }

  /* 匯出：可指定精確輸出尺寸與來源裁切區（正規化座標） */
  async function renderToCanvas(canvas, source, state, options) {
    options = options || {};
    var srcW = source.width || source.naturalWidth || 1;
    var srcH = source.height || source.naturalHeight || 1;
    var crop = options.crop;
    var outW, outH, sx0, sy0, sw, sh;

    if (options.width && options.height) {
      outW = Math.max(1, Math.round(options.width));
      outH = Math.max(1, Math.round(options.height));
      if (crop && (crop.x || crop.y || crop.w < 1 || crop.h < 1)) {
        sx0 = crop.x * srcW;
        sy0 = crop.y * srcH;
        sw = Math.max(1, crop.w * srcW);
        sh = Math.max(1, crop.h * srcH);
      } else {
        sx0 = 0; sy0 = 0; sw = srcW; sh = srcH;
      }
    } else {
      var size = measureExport(srcW, srcH, options.longSide);
      outW = size.width;
      outH = size.height;
      sx0 = 0; sy0 = 0; sw = srcW; sh = srcH;
    }

    if (!sx0 && !sy0 && sw === srcW && sh === srcH) {
      return renderFullToCanvas(canvas, source, state, outW, outH, options);
    }

    /* 先以裁切後的像素密度渲染整張原圖，再取出裁切框。
       倒影可能取自裁切框外的區域，因此不能只把裁切區丟進引擎。 */
    var scaleX = outW / sw;
    var scaleY = outH / sh;
    var fullW = Math.max(1, Math.round(srcW * scaleX));
    var fullH = Math.max(1, Math.round(srcH * scaleY));
    var temp = document.createElement('canvas');
    var rendered = await renderFullToCanvas(temp, source, state, fullW, fullH, options);
    if (rendered && rendered.aborted) return rendered;

    canvas.width = outW;
    canvas.height = outH;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(
      temp,
      sx0 * scaleX, sy0 * scaleY, sw * scaleX, sh * scaleY,
      0, 0, outW, outH
    );
    return { width: outW, height: outH };
  }

  async function loadImage(file) {
    if (!file) throw new Error('沒有選擇檔案');

    if (typeof createImageBitmap === 'function') {
      try {
        var bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        return { source: bitmap, width: bitmap.width, height: bitmap.height };
      } catch (err) {
        /* 某些瀏覽器不支援 options，或格式不支援，改用 <img> */
      }
    }

    return await new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve({ source: img, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error('無法解碼這張圖片，請改用 JPEG 或 PNG'));
      };
      img.src = url;
    });
  }

  window.SkyMirror = {
    DEFAULTS: DEFAULTS,
    PRESETS: PRESETS,
    loadImage: loadImage,
    renderPreview: renderPreview,
    renderToCanvas: renderToCanvas,
    measureExport: measureExport,
    lineSpan: lineSpan,
    _test: {
      geometry: geometry,
      reflectPoint: reflectPoint,
      lineSpan: lineSpan,
      rippleOffset: rippleOffset,
      waveSample: waveSample,
      calmOffset: calmOffset,
      perspGain: perspGain,
      noiseOffset: noiseOffset,
      fbm2: fbm2,
      rowSpan: rowSpan,
      WAVES: WAVES,
      paintRows: paintRows,
      smoothstep: smoothstep,
      foldCoord: foldCoord,
      hslToRgb: hslToRgb,
      rgbToHsl: rgbToHsl,
      measureExport: measureExport,
      normalize: normalize
    }
  };
})();
