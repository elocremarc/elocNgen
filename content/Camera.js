import { vec3, mat4 } from './math';

export class Camera {
  constructor(options = {}) {
    this.position = vec3.create();
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();
    this.aspectRatio = 1;
    this.fov = options.fov ? (options.fov * Math.PI) / 180 : Math.PI / 4; // Convert to radians
    this.near = options.near || 0.1;
    this.far = options.far || 2000;
    this.rotation = { x: 0, y: 0 };
    this.distance = options.position ? vec3.length(options.position) : 5;

    if (options.position) {
      vec3.copy(this.position, options.position);
    }

    this.initEventListeners();
  }

  updateViewProjectionMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspectRatio,
      this.near,
      this.far
    );

    const x =
      this.distance * Math.cos(this.rotation.x) * Math.sin(this.rotation.y);
    const y = this.distance * Math.sin(this.rotation.x);
    const z =
      this.distance * Math.cos(this.rotation.x) * Math.cos(this.rotation.y);
    vec3.set(this.position, x, y, z);

    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);

    mat4.multiply(
      this.viewProjectionMatrix,
      this.projectionMatrix,
      this.viewMatrix
    );
  }

  initEventListeners() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    window.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        previousMousePosition = { x: e.clientX, y: e.clientY };

        // Adjust the rotation angles
        const sensitivity = 0.005;
        this.rotation.y -= deltaX * sensitivity;
        this.rotation.x += deltaY * sensitivity; // Reversed up/down controls

        // Clamp the vertical rotation to prevent flipping
        const limit = Math.PI / 2 - 0.05; // Increased buffer to 0.05 radians
        this.rotation.x = Math.max(-limit, Math.min(limit, this.rotation.x));
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('wheel', (e) => {
      // Adjust the camera distance
      const delta = e.deltaY * 0.01;
      this.distance += delta;
      this.distance = Math.max(1, Math.min(20, this.distance));
    });
  }
}
