// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useRef } from "react"

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Fluid simulation configuration
    const config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.25,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 0, g: 0, b: 0 },
      TRANSPARENT: true,
    }

    const gl = canvas.getContext('webgl2', { alpha: true, preserveDrawingBuffer: false })!
    
    if (!gl) {
      console.warn('WebGL2 not supported')
      return
    }

    // Enable extensions
    gl.getExtension('EXT_color_buffer_float')
    gl.getExtension('OES_texture_float_linear')

    let simWidth: number
    let simHeight: number
    let dyeWidth: number
    let dyeHeight: number
    let density: FBO
    let velocity: FBO
    let divergence: FBO
    let curl: FBO
    let pressure: FBO

    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(0)

      return (destination: WebGLFramebuffer | null) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination)
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
      }
    })()

    class GLProgram {
      uniforms: { [key: string]: WebGLUniformLocation }
      program: WebGLProgram

      constructor(vertexShader: string, fragmentShader: string) {
        this.uniforms = {}
        this.program = gl.createProgram()!

        const vs = this.compileShader(gl.VERTEX_SHADER, vertexShader)
        const fs = this.compileShader(gl.FRAGMENT_SHADER, fragmentShader)

        if (vs == null || fs == null) {
          throw new Error('Shader compilation failed')
        }

        gl.attachShader(this.program, vs)
        gl.attachShader(this.program, fs)
        gl.linkProgram(this.program)

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(this.program) || 'Program link failed')
        }

        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
        for (let i = 0; i < uniformCount; i++) {
          const uniformName = gl.getActiveUniform(this.program, i)!.name
          this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName)!
        }
      }

      compileShader(type: number, source: string): WebGLShader | null {
        const shader = gl.createShader(type)!
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(gl.getShaderInfoLog(shader))
          return null
        }

        return shader
      }

      bind() {
        gl.useProgram(this.program)
      }
    }

    interface FBO {
      texture: WebGLTexture
      fbo: WebGLFramebuffer
      width: number
      height: number
      attach(id: number): number
      read?: FBO
      write?: FBO
      swap?: () => void
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl.activeTexture(gl.TEXTURE0)
      const texture = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null)

      const fbo = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)

      return {
        texture,
        fbo,
        width: w,
        height: h,
        attach(id: number) {
          gl.activeTexture(gl.TEXTURE0 + id)
          gl.bindTexture(gl.TEXTURE_2D, texture)
          return id
        },
      }
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param)
      let fbo2 = createFBO(w, h, internalFormat, format, type, param)

      return {
        get read() {
          return fbo1
        },
        set read(value) {
          fbo1 = value
        },
        get write() {
          return fbo2
        },
        set write(value) {
          fbo2 = value
        },
        swap() {
          const temp = fbo1
          fbo1 = fbo2
          fbo2 = temp
        },
      }
    }

    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `

    const clearShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `

    const displayShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
        vec3 C = texture2D(uTexture, vUv).rgb;
        float a = max(C.r, max(C.g, C.b));
        gl_FragColor = vec4(C, a);
      }
    `

    const splatShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `

    const advectionShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform vec2 dyeTexelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
      }

      void main () {
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        gl_FragColor = dissipation * bilerp(uSource, coord, dyeTexelSize);
        gl_FragColor.a = 1.0;
      }
    `

    const divergenceShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `

    const curlShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `

    const vorticityShader = `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `

    const pressureShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `

    const gradientSubtractShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `

    const clearProgram = new GLProgram(baseVertexShader, clearShader)
    const displayProgram = new GLProgram(baseVertexShader, displayShader)
    const splatProgram = new GLProgram(baseVertexShader, splatShader)
    const advectionProgram = new GLProgram(baseVertexShader, advectionShader)
    const divergenceProgram = new GLProgram(baseVertexShader, divergenceShader)
    const curlProgram = new GLProgram(baseVertexShader, curlShader)
    const vorticityProgram = new GLProgram(baseVertexShader, vorticityShader)
    const pressureProgram = new GLProgram(baseVertexShader, pressureShader)
    const gradienSubtractProgram = new GLProgram(baseVertexShader, gradientSubtractShader)

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION)
      const dyeRes = getResolution(config.DYE_RESOLUTION)

      simWidth = simRes.width
      simHeight = simRes.height
      dyeWidth = dyeRes.width
      dyeHeight = dyeRes.height

      const texType = gl.HALF_FLOAT || gl.FLOAT
      const rgba = gl.RGBA
      const rg = gl.RG
      const r = gl.RED
      const filtering = gl.LINEAR

      density = createDoubleFBO(dyeWidth, dyeHeight, rgba, rgba, texType, filtering)
      velocity = createDoubleFBO(simWidth, simHeight, rg, rg, texType, filtering)
      divergence = createFBO(simWidth, simHeight, r, r, texType, filtering)
      curl = createFBO(simWidth, simHeight, r, r, texType, filtering)
      pressure = createDoubleFBO(simWidth, simHeight, r, r, texType, filtering)
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio

      const max = Math.round(resolution * aspectRatio)
      const min = Math.round(resolution)

      if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min }
      else return { width: min, height: max }
    }

    function resizeCanvas() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        initFramebuffers()
      }
    }

    resizeCanvas()
    initFramebuffers()

    let lastColorChangeTime = Date.now()

    function update() {
      if (!config.PAUSED) {
        const dt = calcDeltaTime()
        if (resizeCanvas()) initFramebuffers()
        step(dt)
      }
      render(null)
      requestAnimationFrame(update)
    }

    let lastUpdateTime = Date.now()

    function calcDeltaTime() {
      const now = Date.now()
      let dt = (now - lastUpdateTime) / 1000
      dt = Math.min(dt, 0.016666)
      lastUpdateTime = now
      return dt
    }

    function step(dt: number) {
      gl.disable(gl.BLEND)
      gl.viewport(0, 0, simWidth, simHeight)

      curlProgram.bind()
      gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0))
      blit(curl.fbo)

      vorticityProgram.bind()
      gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0))
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1))
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL)
      gl.uniform1f(vorticityProgram.uniforms.dt, dt)
      blit(velocity.write.fbo)
      velocity.swap()

      divergenceProgram.bind()
      gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0))
      blit(divergence.fbo)

      clearProgram.bind()
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0))
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE_DISSIPATION)
      blit(pressure.write.fbo)
      pressure.swap()

      pressureProgram.bind()
      gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0))
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1))
        blit(pressure.write.fbo)
        pressure.swap()
      }

      gradienSubtractProgram.bind()
      gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0))
      gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1))
      blit(velocity.write.fbo)
      velocity.swap()

      advectionProgram.bind()
      gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / simWidth, 1.0 / simHeight)
      if (!gl.getExtension('OES_texture_float_linear')) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1.0 / simWidth, 1.0 / simHeight)
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
        gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0))
        gl.uniform1f(advectionProgram.uniforms.dt, dt)
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION)
        blit(velocity.write.fbo)
        velocity.swap()
      }

      gl.viewport(0, 0, dyeWidth, dyeHeight)

      if (!gl.getExtension('OES_texture_float_linear')) {
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1.0 / dyeWidth, 1.0 / dyeHeight)
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0))
        gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1))
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION)
        blit(density.write.fbo)
        density.swap()
      }
    }

    function render(target: WebGLFramebuffer | null) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.BLEND)
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

      displayProgram.bind()
      gl.uniform1i(displayProgram.uniforms.uTexture, density.read.attach(0))
      blit(target)
    }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
      gl.viewport(0, 0, simWidth, simHeight)
      splatProgram.bind()
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0))
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height)
      gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height)
      gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0)
      gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS / 100.0)
      blit(velocity.write.fbo)
      velocity.swap()

      gl.viewport(0, 0, dyeWidth, dyeHeight)
      gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0))
      gl.uniform3f(splatProgram.uniforms.color, color.r * 0.3, color.g * 0.3, color.b * 0.3)
      blit(density.write.fbo)
      density.swap()
    }

    function randomColor() {
      const c = HSVtoRGB(Math.random(), 1.0, 1.0)
      c.r *= 0.15
      c.g *= 0.15
      c.b *= 0.15
      return c
    }

    function HSVtoRGB(h: number, s: number, v: number) {
      let r = 0,
        g = 0,
        b = 0
      const i = Math.floor(h * 6)
      const f = h * 6 - i
      const p = v * (1 - s)
      const q = v * (1 - f * s)
      const t = v * (1 - (1 - f) * s)

      switch (i % 6) {
        case 0:
          ;(r = v), (g = t), (b = p)
          break
        case 1:
          ;(r = q), (g = v), (b = p)
          break
        case 2:
          ;(r = p), (g = v), (b = t)
          break
        case 3:
          ;(r = p), (g = q), (b = v)
          break
        case 4:
          ;(r = t), (g = p), (b = v)
          break
        case 5:
          ;(r = v), (g = p), (b = q)
          break
      }

      return {
        r,
        g,
        b,
      }
    }

    const pointers: Array<{
      id: number
      x: number
      y: number
      dx: number
      dy: number
      down: boolean
      moved: boolean
      color: { r: number; g: number; b: number }
    }> = []

    pointers.push({
      id: -1,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      down: false,
      moved: false,
      color: randomColor(),
    })

    canvas.addEventListener('mousemove', (e) => {
      const pointer = pointers[0]
      const posX = e.offsetX
      const posY = e.offsetY
      updatePointerMoveData(pointer, posX, posY)
    })

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const touches = e.targetTouches
      for (let i = 0; i < touches.length; i++) {
        let pointer = pointers[i]
        if (!pointer) {
          pointer = {
            id: i,
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            down: true,
            moved: false,
            color: randomColor(),
          }
          pointers.push(pointer)
        }
        const rect = canvas.getBoundingClientRect()
        updatePointerMoveData(pointer, touches[i].clientX - rect.left, touches[i].clientY - rect.top)
      }
    }, { passive: false })

    canvas.addEventListener('mousedown', () => {
      const pointer = pointers[0]
      if (!pointer) return
      pointer.down = true
      pointer.color = randomColor()
    })

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touches = e.targetTouches
      for (let i = 0; i < touches.length; i++) {
        if (i >= pointers.length) {
          pointers.push({
            id: i,
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            down: true,
            moved: false,
            color: randomColor(),
          })
        }
        const rect = canvas.getBoundingClientRect()
        updatePointerDownData(pointers[i], touches[i].clientX - rect.left, touches[i].clientY - rect.top)
      }
    })

    window.addEventListener('mouseup', () => {
      const pointer = pointers[0]
      if (!pointer) return
      pointer.down = false
    })

    window.addEventListener('touchend', (e) => {
      const touches = e.changedTouches
      for (let i = 0; i < touches.length; i++) {
        for (let j = 0; j < pointers.length; j++) {
          if (pointers[j].id === touches[i].identifier) {
            pointers[j].down = false
          }
        }
      }
    })

    function updatePointerDownData(pointer: (typeof pointers)[0], posX: number, posY: number) {
      pointer.x = posX
      pointer.y = posY
      pointer.down = true
      pointer.moved = false
      pointer.color = randomColor()
    }

    function updatePointerMoveData(pointer: (typeof pointers)[0], posX: number, posY: number) {
      pointer.dx = (posX - pointer.x) * 10.0
      pointer.dy = (posY - pointer.y) * 10.0
      pointer.x = posX
      pointer.y = posY
      pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0
    }

    function updatePointerUpData(pointer: (typeof pointers)[0]) {
      pointer.down = false
    }

    function updatePointers() {
      for (let i = 0; i < pointers.length; i++) {
        const pointer = pointers[i]
        if (pointer.moved) {
          splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color)
          pointer.moved = false
        }
      }
    }

    function splatStack(amount: number) {
      for (let i = 0; i < amount; i++) {
        const color = randomColor()
        const x = canvas.width * Math.random()
        const y = canvas.height * Math.random()
        const dx = 1000 * (Math.random() - 0.5)
        const dy = 1000 * (Math.random() - 0.5)
        splat(x, y, dx, dy, color)
      }
    }

    // Start with some initial splats
    splatStack(parseInt(String(Math.random() * 20)) + 5)

    function animate() {
      updatePointers()
      step(0.016)
      render(null)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto opacity-60 mix-blend-screen touch-none"
    />
  )
}
