// elocNgen.js

import { defaultVertex, defaultFragment } from './shaders/defaultShaders.js';
import { mat4, mat3, vec3, GeometryUtils } from './math.js';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';

// Add these utility functions at the top of the file
function invertNormals(vertices) {
  const stride = 6; // Number of components per vertex
  for (let i = 0; i < vertices.length; i += stride) {
    vertices[i + 3] *= -1; // normX
    vertices[i + 4] *= -1; // normY
    vertices[i + 5] *= -1; // normZ
  }
}

export class Eloc {
  constructor(options = {}) {
    // Create and append the canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'webgpu-canvas';
    document.body.appendChild(this.canvas);

    this.device = null;
    this.context = null;
    this.format = null;
    this.scene = new Scene();
    this.camera = new Camera(options.camera);
    this.renderer = null;
    this.options = {
      shadows: options.shadows || false,
      flat: options.flat || false,
      dpr: options.dpr || 1,
      alpha: options.alpha || false,
      depth: options.depth || true,
      stencil: options.stencil || false,
      antialias: options.antialias || false,
      precision: options.precision || 'highp',
    };
  }

  static async createMedium(options = {}) {
    const eloc = new Eloc(options);
    await eloc.init();
    return eloc;
  }

  async init() {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported on this browser.');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new Error('Failed to get GPU adapter.');
    }

    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext('webgpu');
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: this.options.alpha ? 'premultiplied' : 'opaque',
    });

    this.renderer = new Renderer(
      this.device,
      this.format,
      this.context,
      this.options
    );
    this.resize();

    window.addEventListener('resize', () => this.resize());
    this.render();
  }

  resize() {
    const devicePixelRatio = this.options.dpr * (window.devicePixelRatio || 1);
    this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * devicePixelRatio;

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: this.options.alpha ? 'premultiplied' : 'opaque',
    });

    this.camera.aspectRatio = this.canvas.width / this.canvas.height;
    this.renderer.createDepthTexture(this.canvas.width, this.canvas.height);
  }

  render() {
    this.camera.updateViewProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}

export class Scene {
  constructor() {
    this.children = [];
    this.lights = [];
  }

  add(object) {
    if (object instanceof Light) {
      this.lights.push(object);
    } else {
      this.children.push(object);
    }
  }
}

export class Light {
  constructor(options = {}) {
    this.type = options.type || 'point'; // 'directional', 'spot', etc.
    this.position = options.position || [0, 0, 0];
    this.color = options.color || [1, 1, 1]; // RGB values
    this.intensity = options.intensity || 1.0;
  }
}

export class Object3D {
  constructor() {
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0]; // Euler angles in radians
    this.scale = [1, 1, 1];
    this.modelMatrix = mat4.create();
    this.updateModelMatrix();
  }

  updateModelMatrix() {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
    mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
  }
}

export class Mesh {
  constructor(medium, geometryData, options = {}) {
    const { vertexShaderCode, fragmentShaderCode } =
      Mesh.createMaterialShaders(options);

    this.geometry = new Geometry(
      medium.device,
      geometryData.vertices,
      geometryData.indices
    );
    this.material = new Material(
      medium.device,
      medium.renderer.uniformBindGroupLayout,
      vertexShaderCode,
      fragmentShaderCode
    );

    // Initialize transformation properties
    this.position = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.modelMatrix = mat4.create();

    // Create the uniform buffer using the UniformBuffer class
    this.uniforms = new Uniforms();
    this.uniformBuffer = new UniformBuffer(this.material.device, this.uniforms);

    this.uniformBindGroup = this.material.device.createBindGroup({
      layout: this.material.uniformBindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: this.uniformBuffer.buffer } },
      ],
    });
  }

  // Method to set position
  setPosition(x, y, z) {
    this.position = [x, y, z];
    this.updateModelMatrix();
  }

  // Method to set rotation
  setRotation(x, y, z) {
    this.rotation = [x, y, z];
    this.updateModelMatrix();
  }

  // Method to set scale
  setScale(x, y, z) {
    this.scale = [x, y, z];
    this.updateModelMatrix();
  }

  updateModelMatrix() {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
    mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
  }

  updateUniforms(camera, scene) {
    this.updateModelMatrix();

    // Compute the Model-View Matrix
    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, camera.viewMatrix, this.modelMatrix);

    // Store the Model-View Matrix in uniforms
    this.uniforms.modelViewMatrix.set(modelViewMatrix);

    // Compute the Model-View-Projection Matrix
    mat4.multiply(
      this.uniforms.modelViewProjectionMatrix,
      camera.projectionMatrix,
      modelViewMatrix
    );

    // Compute the Normal Matrix from the Model-View Matrix
    const normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, modelViewMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    this.uniforms.normalMatrix.set(normalMatrix);

    // Transform the Light Position into Eye Space
    const light = scene.lights[0];
    if (light) {
      const lightPosition = vec3.create();
      vec3.transformMat4(lightPosition, light.position, camera.viewMatrix);

      this.uniforms.lightPosition.set(lightPosition);
      this.uniforms.lightColor.set(light.color);
      this.uniforms.lightIntensity = light.intensity;
    }

    // Update the Uniform Buffer
    this.uniformBuffer.update();
  }

  // Utility method to create shaders
  static createMaterialShaders(options) {
    return {
      vertexShaderCode: options.vertexShaderCode || defaultVertex,
      fragmentShaderCode: options.fragmentShaderCode || defaultFragment,
    };
  }
}

export class Uniforms {
  constructor() {
    this.modelViewProjectionMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.normalMatrix = mat3.create();

    // Light uniforms
    this.lightPosition = new Float32Array(3);
    this.lightColor = new Float32Array(3);
    this.lightIntensity = 1.0;
  }
}

export class UniformBuffer {
  constructor(device, uniforms) {
    this.device = device;
    this.uniforms = uniforms;

    const { offsets, totalSize } = this.calculateOffsets();
    this.buffer = device.createBuffer({
      size: totalSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.offsets = offsets;
    this.totalSize = totalSize;
  }

  calculateOffsets() {
    let offset = 0;
    const offsets = {};

    // ModelViewProjectionMatrix (mat4x4<f32>)
    offsets.modelViewProjectionMatrix = offset;
    offset += 64; // 16 floats * 4 bytes

    // ModelViewMatrix (mat4x4<f32>)
    offsets.modelViewMatrix = offset;
    offset += 64; // 16 floats * 4 bytes

    // NormalMatrix (mat3x3<f32>)
    offsets.normalMatrix = offset;
    offset += 48; // 12 floats * 4 bytes

    // Padding to align to 16-byte boundary
    offset = this.alignTo(offset, 16);
    offsets.padding0 = offset;
    offset += 16; // padding0 (array<f32, 4>)

    // LightPosition (vec3<f32>) padded to 16 bytes
    offsets.lightPosition = offset;
    offset += 16; // vec3<f32> + padding

    // LightColor (vec3<f32>) padded to 16 bytes
    offsets.lightColor = offset;
    offset += 16; // vec3<f32> + padding

    // LightIntensity (f32)
    offsets.lightIntensity = offset;
    offset += 4; // f32

    // Padding to align total size to 16 bytes
    offset = this.alignTo(offset, 16);
    offsets.padding1 = offset;
    offset += 12; // padding1 (array<f32, 3>)

    const totalSize = this.alignTo(offset, 16);

    return { offsets, totalSize };
  }

  alignTo(offset, alignment) {
    return Math.ceil(offset / alignment) * alignment;
  }

  update() {
    const data = new Float32Array(this.totalSize / 4);

    // Copy modelViewProjectionMatrix
    data.set(
      this.uniforms.modelViewProjectionMatrix,
      this.offsets.modelViewProjectionMatrix / 4
    );

    // Copy modelViewMatrix
    data.set(this.uniforms.modelViewMatrix, this.offsets.modelViewMatrix / 4);

    // Copy normalMatrix (pad each vec3 to 16 bytes)
    const normalMatrix = this.uniforms.normalMatrix;
    // normalMatrix is 3 vec3<f32>, need to add padding
    data.set(normalMatrix.slice(0, 3), this.offsets.normalMatrix / 4 + 0); // First vec3
    data.set(
      [normalMatrix[3], normalMatrix[4], normalMatrix[5]],
      this.offsets.normalMatrix / 4 + 4
    ); // Second vec3
    data.set(
      [normalMatrix[6], normalMatrix[7], normalMatrix[8]],
      this.offsets.normalMatrix / 4 + 8
    ); // Third vec3

    // Padding0 is already accounted for in offsets

    // LightPosition
    data.set(this.uniforms.lightPosition, this.offsets.lightPosition / 4);

    // LightColor
    data.set(this.uniforms.lightColor, this.offsets.lightColor / 4);

    // LightIntensity
    data[this.offsets.lightIntensity / 4] = this.uniforms.lightIntensity;

    // Write the buffer to the GPU
    this.device.queue.writeBuffer(this.buffer, 0, data.buffer);
  }
}

export class Material {
  constructor(
    device,
    uniformBindGroupLayout,
    vertexShaderCode,
    fragmentShaderCode
  ) {
    this.device = device;
    this.vertexShaderCode = vertexShaderCode;
    this.fragmentShaderCode = fragmentShaderCode;
    this.pipeline = null;

    // Create shader modules
    this.vertexShaderModule = this.device.createShaderModule({
      code: this.vertexShaderCode,
    });

    this.fragmentShaderModule = this.device.createShaderModule({
      code: this.fragmentShaderCode,
    });

    // Use the provided uniformBindGroupLayout
    this.uniformBindGroupLayout = uniformBindGroupLayout;
  }

  createPipeline(device, format) {
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [this.uniformBindGroupLayout],
    });

    const vertexBuffers = [
      {
        arrayStride: 6 * 4, // 6 floats per vertex (position + normal)
        attributes: [
          { shaderLocation: 0, offset: 0, format: 'float32x3' },
          { shaderLocation: 1, offset: 3 * 4, format: 'float32x3' },
        ],
      },
    ];

    this.pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: this.vertexShaderModule,
        entryPoint: 'vs_main',
        buffers: vertexBuffers,
      },
      fragment: {
        module: this.fragmentShaderModule,
        entryPoint: 'fs_main',
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
      },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
    });
  }
}

// Cube class
export class Cube extends Mesh {
  constructor(medium, options = {}, size = 1, subdivisions = 1) {
    const geometryData = GeometryUtils.createCubeData(size, subdivisions);
    super(medium, geometryData, options);
  }
}

// Sphere class
export class Sphere extends Mesh {
  constructor(
    medium,
    options = {},
    radius = 1,
    latitudeBands = 30,
    longitudeBands = 30
  ) {
    const geometryData = GeometryUtils.createSphereData(
      radius,
      latitudeBands,
      longitudeBands
    );
    super(medium, geometryData, options);
  }
}

export class Geometry {
  constructor(device, vertices, indices) {
    this.device = device;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.indexCount = indices.length;
    this.indexFormat = indices instanceof Uint32Array ? 'uint32' : 'uint16';
    this.createBuffers(vertices, indices);
  }

  createBuffers(vertices, indices) {
    // Create vertex buffer
    this.vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertices.buffer);

    // Create index buffer
    this.indexBuffer = this.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.indexBuffer, 0, indices.buffer);
  }
}

// Add the transformMat3 method to the vec3 object in the math.js file
// If you don't have direct access to modify math.js, you can add this method here:
vec3.transformMat3 = function (out, a, m) {
  const x = a[0],
    y = a[1],
    z = a[2];
  out[0] = m[0] * x + m[3] * y + m[6] * z;
  out[1] = m[1] * x + m[4] * y + m[7] * z;
  out[2] = m[2] * x + m[5] * y + m[8] * z;
  return out;
};

// Add these new methods to vec3
vec3.transformMat4 = function (out, a, m) {
  const x = a[0],
    y = a[1],
    z = a[2],
    w = 1.0;
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  return out;
};
