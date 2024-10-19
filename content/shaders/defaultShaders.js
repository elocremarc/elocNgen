// Default Shader Code (vertex and fragment shaders)

export const defaultVertex = `
struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
  modelViewMatrix : mat4x4<f32>,
  normalMatrix : mat3x3<f32>,
  padding : vec4<f32>,
  lightPosition : vec3<f32>,
  padding1 : f32,
  lightColor : vec3<f32>,
  padding2 : f32,
  lightIntensity : f32,
};

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct VertexInput {
  @location(0) position : vec3<f32>,
  @location(1) normal : vec3<f32>,
};

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) normal : vec3<f32>,
  @location(1) fragPosition : vec3<f32>,
};

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
  var output : VertexOutput;
  let eyePosition = uniforms.modelViewMatrix * vec4<f32>(input.position, 1.0);
  output.position = uniforms.modelViewProjectionMatrix * vec4<f32>(input.position, 1.0);
  output.normal = uniforms.normalMatrix * input.normal;
  output.fragPosition = eyePosition.xyz;
  return output;
}
`;

export const defaultFragment = `
struct Uniforms {
  modelViewProjectionMatrix : mat4x4<f32>,
  modelViewMatrix : mat4x4<f32>,
  normalMatrix : mat3x3<f32>,
  padding : vec4<f32>,
  lightPosition : vec3<f32>,
  padding1 : f32,
  lightColor : vec3<f32>,
  padding2 : f32,
  lightIntensity : f32,
};

@binding(0) @group(0) var<uniform> uniforms : Uniforms;

struct FragmentInput {
  @location(0) normal : vec3<f32>,
  @location(1) fragPosition : vec3<f32>,
};

@fragment
fn fs_main(input: FragmentInput) -> @location(0) vec4<f32> {
  let normal = normalize(input.normal);
  let lightDir = normalize(uniforms.lightPosition - input.fragPosition);
  let diff = max(dot(normal, lightDir), 0.0);
  let diffuse = diff * uniforms.lightColor * uniforms.lightIntensity;

  let ambient = 0.1 * uniforms.lightColor;
  let baseColor = vec3<f32>(0.6, 0.7, 0.8);
  let color = (ambient + diffuse) * baseColor;
  return vec4<f32>(color, 1.0);
}
`;
