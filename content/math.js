// Minimal vec3 implementation

export const vec3 = {
  create() {
    return new Float32Array(3);
  },
  fromValues(x, y, z) {
    const out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  },
  set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
  },
  copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
  },
  length(a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  },
  transformMat3(out, a, m) {
    const x = a[0],
      y = a[1],
      z = a[2];
    out[0] = m[0] * x + m[3] * y + m[6] * z;
    out[1] = m[1] * x + m[4] * y + m[7] * z;
    out[2] = m[2] * x + m[5] * y + m[8] * z;
    return out;
  },
  transformMat4(out, a, m) {
    const x = a[0],
      y = a[1],
      z = a[2],
      w = 1.0;
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    return out;
  },
};

export const mat3 = {
  create() {
    const out = new Float32Array(9);
    out[0] = 1; // Column 0, Row 0
    out[1] = 0; // Column 0, Row 1
    out[2] = 0; // Column 0, Row 2
    out[3] = 0; // Column 1, Row 0
    out[4] = 1; // Column 1, Row 1
    out[5] = 0; // Column 1, Row 2
    out[6] = 0; // Column 2, Row 0
    out[7] = 0; // Column 2, Row 1
    out[8] = 1; // Column 2, Row 2
    return out;
  },
  fromMat4(out, m) {
    // Extract upper-left 3x3 matrix
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[4];
    out[4] = m[5];
    out[5] = m[6];
    out[6] = m[8];
    out[7] = m[9];
    out[8] = m[10];
    return out;
  },
  invert(out, a) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    const a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    const a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;

    return out;
  },
  transpose(out, a) {
    if (out === a) {
      let a01 = a[1],
        a02 = a[2],
        a12 = a[5];

      out[1] = a[3];
      out[2] = a[6];
      out[3] = a01;
      out[5] = a[7];
      out[6] = a02;
      out[7] = a12;
    } else {
      out[0] = a[0];
      out[1] = a[3];
      out[2] = a[6];
      out[3] = a[1];
      out[4] = a[4];
      out[5] = a[7];
      out[6] = a[2];
      out[7] = a[5];
      out[8] = a[8];
    }
    return out;
  },
};

// Minimal mat4 implementation

export const mat4 = {
  create() {
    const out = new Float32Array(16);
    out[0] = 1; // Column 0, Row 0
    out[1] = 0; // Column 0, Row 1
    out[2] = 0; // Column 0, Row 2
    out[3] = 0; // Column 0, Row 3
    out[4] = 0; // Column 1, Row 0
    out[5] = 1; // Column 1, Row 1
    out[6] = 0; // Column 1, Row 2
    out[7] = 0; // Column 1, Row 3
    out[8] = 0; // Column 2, Row 0
    out[9] = 0; // Column 2, Row 1
    out[10] = 1; // Column 2, Row 2
    out[11] = 0; // Column 2, Row 3
    out[12] = 0; // Column 3, Row 0
    out[13] = 0; // Column 3, Row 1
    out[14] = 0; // Column 3, Row 2
    out[15] = 1; // Column 3, Row 3
    return out;
  },
  identity(out) {
    out.fill(0);
    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
  },
  perspective(out, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
  },
  lookAt(out, eye, center, up) {
    let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    const eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2];
    const upx = up[0],
      upy = up[1],
      upz = up[2];
    const centerx = center[0],
      centery = center[1],
      centerz = center[2];

    if (
      Math.abs(eyex - centerx) < 0.000001 &&
      Math.abs(eyey - centery) < 0.000001 &&
      Math.abs(eyez - centerz) < 0.000001
    ) {
      this.identity(out);
      return;
    }

    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    len = 1 / Math.hypot(z0, z1, z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.hypot(x0, x1, x2);
    if (len === 0) {
      x0 = 0;
      x1 = 0;
      x2 = 0;
    } else {
      len = 1 / len;
      x0 *= len;
      x1 *= len;
      x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;

    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;

    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;

    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
  },
  translate(out, a, v) {
    const x = v[0],
      y = v[1],
      z = v[2];

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      out[3] = a[3];

      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];

      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];

      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    }
  },
  rotateX(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];

    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];

    // Perform axis-specific matrix multiplication
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;

    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;

    // Copy the rest
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  },
  rotateY(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];

    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;

    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;

    // Copy the rest
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  },
  rotateZ(out, a, rad) {
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];

    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;

    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;

    // Copy the rest
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  },
  scale(out, a, v) {
    const x = v[0],
      y = v[1],
      z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;

    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;

    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;

    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  },
  multiply(out, a, b) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    const b00 = b[0],
      b01 = b[1],
      b02 = b[2],
      b03 = b[3];
    const b10 = b[4],
      b11 = b[5],
      b12 = b[6],
      b13 = b[7];
    const b20 = b[8],
      b21 = b[9],
      b22 = b[10],
      b23 = b[11];
    const b30 = b[12],
      b31 = b[13],
      b32 = b[14],
      b33 = b[15];

    out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

    out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

    out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

    out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
    out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
    out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
    out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  },
  invert(out, a) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det =
      b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;

    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;

    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;

    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  },
  transpose(out, a) {
    if (out === a) {
      let a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a12 = a[6],
        a13 = a[7],
        a23 = a[11];

      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a01;
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a02;
      out[9] = a12;
      out[11] = a[14];
      out[12] = a03;
      out[13] = a13;
      out[14] = a23;
    } else {
      out[0] = a[0];
      out[1] = a[4];
      out[2] = a[8];
      out[3] = a[12];
      out[4] = a[1];
      out[5] = a[5];
      out[6] = a[9];
      out[7] = a[13];
      out[8] = a[2];
      out[9] = a[6];
      out[10] = a[10];
      out[11] = a[14];
      out[12] = a[3];
      out[13] = a[7];
      out[14] = a[11];
      out[15] = a[15];
    }
    return out;
  },
};

export const vec4 = {
  create() {
    return new Float32Array(4);
  },
  fromValues(x, y, z, w) {
    const out = new Float32Array(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
  },
  set(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
  },
  copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
  },
  length(a) {
    return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2 + a[3] ** 2);
  },
  // ... you can add more vec4 functions as needed ...
};

export class GeometryUtils {
  static createVertices(positions, normals) {
    const vertexCount = positions.length / 3;
    const vertices = new Float32Array(vertexCount * 6);
    for (let i = 0; i < vertexCount; i++) {
      vertices.set(positions.slice(i * 3, i * 3 + 3), i * 6);
      vertices.set(normals.slice(i * 3, i * 3 + 3), i * 6 + 3);
    }
    return vertices;
  }

  static createCubeData(size, subdivisions) {
    const half = size / 2;
    const step = size / subdivisions;
    const positions = [];
    const normals = [];
    const indices = [];

    const faceAxes = [
      { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] }, // Front
      { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }, // Back
      { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] }, // Top
      { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] }, // Bottom
      { normal: [1, 0, 0], u: [0, 1, 0], v: [0, 0, -1] }, // Right
      { normal: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] }, // Left
    ];

    let vertexOffset = 0;

    for (const face of faceAxes) {
      const facePositions = [];
      const faceNormals = [];

      for (let i = 0; i <= subdivisions; i++) {
        for (let j = 0; j <= subdivisions; j++) {
          const u = -half + i * step;
          const v = -half + j * step;

          const position = [
            face.normal[0] * half + u * face.u[0] + v * face.v[0],
            face.normal[1] * half + u * face.u[1] + v * face.v[1],
            face.normal[2] * half + u * face.u[2] + v * face.v[2],
          ];

          facePositions.push(...position);
          faceNormals.push(...face.normal);
        }
      }

      // Create indices for this face
      for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
          const a = vertexOffset + i * (subdivisions + 1) + j;
          const b = a + subdivisions + 1;
          const c = b + 1;
          const d = a + 1;

          // Indices for two triangles per quad, directly in CCW order
          indices.push(a, d, b); // Triangle 1
          indices.push(b, d, c); // Triangle 2
        }
      }

      positions.push(...facePositions);
      normals.push(...faceNormals);

      vertexOffset += (subdivisions + 1) * (subdivisions + 1);
    }

    const vertices = GeometryUtils.createVertices(positions, normals);
    return {
      vertices,
      indices:
        indices.length > 65535
          ? new Uint32Array(indices)
          : new Uint16Array(indices),
    };
  }

  static createSphereData(radius, latitudeBands, longitudeBands) {
    const positions = [];
    const normals = [];
    const indices = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
      const theta = (latNumber * Math.PI) / latitudeBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
        const phi = (longNumber * 2 * Math.PI) / longitudeBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        positions.push(radius * x, radius * y, radius * z);
        normals.push(x, y, z);
      }
    }

    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
      for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
        const first = latNumber * (longitudeBands + 1) + longNumber;
        const second = first + longitudeBands + 1;

        // Indices for two triangles per quad, directly in CCW order
        indices.push(first, first + 1, second); // Triangle 1
        indices.push(second, first + 1, second + 1); // Triangle 2
      }
    }

    const vertices = GeometryUtils.createVertices(positions, normals);
    return {
      vertices,
      indices:
        indices.length > 65535
          ? new Uint32Array(indices)
          : new Uint16Array(indices),
    };
  }
}
