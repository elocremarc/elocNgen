import { Mesh } from './elocNgen';

export class Renderer {
  constructor(device, format, context, options) {
    this.device = device;
    this.format = format;
    this.context = context;
    this.depthTexture = null;
    this.options = options;

    // Initialize common bind group layout
    this.uniformBindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: { type: 'uniform' },
        },
      ],
    });
  }

  createDepthTexture(width, height) {
    this.depthTexture = this.device.createTexture({
      size: [width, height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  render(scene, camera) {
    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          loadOp: 'clear',
          clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthLoadOp: 'clear',
        depthClearValue: 1.0,
        depthStoreOp: 'store',
      },
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    for (const object of scene.children) {
      if (object instanceof Mesh) {
        object.updateUniforms(camera, scene);

        if (!object.material.pipeline) {
          // Create the pipeline if it doesn't exist
          object.material.createPipeline(this.device, this.format);
        }

        passEncoder.setPipeline(object.material.pipeline);
        passEncoder.setBindGroup(0, object.uniformBindGroup);
        passEncoder.setVertexBuffer(0, object.geometry.vertexBuffer);
        passEncoder.setIndexBuffer(
          object.geometry.indexBuffer,
          object.geometry.indexFormat
        );
        passEncoder.drawIndexed(object.geometry.indexCount, 1, 0, 0, 0);
      }
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}
