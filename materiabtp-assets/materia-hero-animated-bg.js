(function () {
  "use strict";

  var VERT = [
    "#version 300 es",
    "precision highp float;",
    "const vec2 P[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));",
    "void main() { gl_Position = vec4(P[gl_VertexID], 0., 1.); }",
  ].join("\n");

  var FRAG = [
    "#version 300 es",
    "precision highp float;",
    "out vec4 o;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "uniform vec2 u_mouse;",
    "uniform float u_mvel;",
    "",
    "float hash(vec2 p) {",
    "  p = fract(p * vec2(123.34, 456.21));",
    "  p += dot(p, p + 45.32);",
    "  return fract(p.x * p.y);",
    "}",
    "",
    "float noise(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3. - 2. * f);",
    "  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    "",
    "float fbm(vec2 p) {",
    "  float v = 0., a = .5;",
    "  mat2 r = mat2(.8, .6, -.6, .8);",
    "  for (int i = 0; i < 5; i++) {",
    "    v += a * noise(p);",
    "    p = r * p * 2.03;",
    "    a *= .5;",
    "  }",
    "  return v;",
    "}",
    "",
    "void main() {",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  vec2 p = uv;",
    "  p.x *= u_res.x / u_res.y;",
    "",
    "  float t = u_time * .045;",
    "",
    "  vec2 m = u_mouse;",
    "  m.x *= u_res.x / u_res.y;",
    "  vec2 dm = p - m;",
    "  float dist = length(dm);",
    "  float swirl = exp(-dist * 3.2) * (.55 + u_mvel * 5.);",
    "  float ang = swirl * 2.4;",
    "  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));",
    "  vec2 q = m + rot * dm;",
    "",
    "  vec2 w1 = vec2(fbm(q * 1.6 + vec2(t, -t * .7)), fbm(q * 1.6 + vec2(-t * .8, t)));",
    "  vec2 w2 = vec2(fbm(q * 2.2 + 2.7 * w1 + vec2(1.3, 9.2)), fbm(q * 2.2 + 2.7 * w1 + vec2(8.1, 2.4)));",
    "  float ink = fbm(q * 2.8 + 2.2 * w2 + vec2(t * .6, 0.));",
    "",
    "  float veil = smoothstep(.38, .78, ink);",
    "  float wisp = smoothstep(.52, .62, ink) * .75;",
    "  float halo = exp(-dist * 2.6) * .35;",
    "",
    "  vec2 c = (uv - vec2(.5, .58)) * vec2(1.15, 1.55);",
    "  float readable = 1. - exp(-dot(c, c) * 3.2);",
    "  float d = (veil * .62 + wisp + halo) * mix(.18, .76, readable);",
    "",
    "  vec3 deep = vec3(0.0, 0.094, 0.188);",
    "  vec3 vivid = vec3(0.0, 0.208, 0.663);",
    "  vec3 skyc = vec3(0.208, 0.502, 0.831);",
    "  vec3 tint = mix(deep, vivid, smoothstep(.3, .75, ink));",
    "  tint = mix(tint, skyc, smoothstep(.7, .95, ink + halo));",
    "",
    "  vec3 col = vec3(1.) - d * (vec3(1.) - tint) * .94;",
    "",
    "  o = vec4(col, 1.);",
    "}",
  ].join("\n");

  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function initCanvas(canvas) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return null;
    }

    var gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return null;

    var vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }
    gl.useProgram(program);

    var uRes = gl.getUniformLocation(program, "u_res");
    var uTime = gl.getUniformLocation(program, "u_time");
    var uMouse = gl.getUniformLocation(program, "u_mouse");
    var uMvel = gl.getUniformLocation(program, "u_mvel");
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    function resize() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();

    var target = { x: 0.5, y: 0.55 };
    var smooth = { x: 0.5, y: 0.55 };
    var mvel = 0;
    var raf = 0;
    var running = true;
    var t0 = performance.now();

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    }

    function frame(now) {
      if (!running) return;

      var dx = target.x - smooth.x;
      var dy = target.y - smooth.y;
      smooth.x += 0.06 * dx;
      smooth.y += 0.06 * dy;
      mvel += (Math.hypot(dx, dy) - mvel) * 0.08;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, smooth.x, smooth.y);
      gl.uniform1f(uMvel, mvel);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    var ro = new ResizeObserver(resize);
    ro.observe(canvas);

    var io = new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting && !document.hidden;
      if (visible && !running) {
        running = true;
        t0 = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!visible) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        t0 = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    canvas.dataset.webgl = "true";

    return function cleanup() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }

  function boot() {
    var canvas = document.querySelector(".materia-hero-bg");
    if (!canvas) return;
    initCanvas(canvas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
