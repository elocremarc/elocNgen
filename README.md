# Engine Goals

## Summary

The goal of the project is to implement a new 3D engine in WebGPU by building everything from scratch as much as possible. The engine emphasizes simplicity and elegance in its codebase, ensuring that all components are super simple and easy to maintain. It is a WebGPU-based rendering system designed to display 3D objects with custom shaders. The engine initializes a rendering medium with specific camera settings and shader precision, and it supports adding various shapes like spheres and cubes to the scene. Custom vertex and fragment shaders written in WGSL create dynamic visual effects such as gelatinous deformations and swirling color patterns. Additionally, the engine aims to incorporate a lightweight 2D image system and SVG generation capabilities to enhance versatility and functionality.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/elocremarc/elocngen.git
   cd elocngen
   ```

2. Install dependencies:
   ```
   bun install
   ```

### Running the App

- To start the development server:

  ```
  bun run dev
  ```

  This will start the Vite development server. Open your browser and navigate to the URL provided in the console (usually `http://localhost:5173`).

- To build the app for production:
  ```
  bun run build
  ```
  This will generate optimized files in the `dist` directory.

## Goals

| #   | Goal                               | Description                                                                                                              | Progress       |
| --- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 1   | Implement Instancing               | Enable efficient rendering of multiple instances of objects with custom shaders.                                         | 📝 Planned     |
| 2   | Develop State Management System    | Create a lightweight state system inspired by React without additional overhead.                                         | 📝 Planned     |
| 3   | Implement Lighting System          | Add dynamic lighting to enhance visual effects.                                                                          | 🚧 In Progress |
| 4   | Add User Interaction Features      | Enable user controls for object manipulation and interaction.                                                            | 📝 Planned     |
| 5   | Enhance Camera Controls            | Provide more intuitive and versatile camera controls for better navigation.                                              | 📝 Planned     |
| 6   | Create Animation System            | Develop a timeline-based animation system for smooth and precise timing control.                                         | 📝 Planned     |
| 7   | Optimize Shader Performance        | Improve shader efficiency for better performance.                                                                        | 📝 Planned     |
| 8   | Integrate Physics Engine           | Incorporate physics for realistic object behavior.                                                                       | 📝 Planned     |
| 9   | Develop Timeline-based Editor      | Create a clean and elegant timeline-based editor for managing animations.                                                | 📝 Planned     |
| 10  | **Add Fog Effects**                | Implement fog effects to enhance depth perception and atmosphere.                                                        | 📝 Planned     |
| 11  | **Add Post Processing**            | Incorporate post-processing effects for final image enhancements.                                                        | 📝 Planned     |
| 12  | **Develop Particle Effect System** | Create a simulation particle effect system using compute shaders.                                                        | 📝 Planned     |
| 13  | **Create Generative Textures**     | Use compute shaders to generate dynamic textures procedurally.                                                           | 📝 Planned     |
| 14  | **Create 2D Image System**         | Develop a lightweight 2D image system with a layered shader architecture similar to Photoshop.                           | 📝 Planned     |
| 15  | **Implement SVG Generation**       | Incorporate SVG generation capabilities akin to Illustrator for creating curves and CAD-like geometry within the engine. | 📝 Planned     |

## Footer

Feel free to fill in the **Goals** section with your specific objectives. Use relevant emojis in the "Progress" column to indicate the status of each goal. For example:

| Goal                          | Description                                        | Progress       |
| ----------------------------- | -------------------------------------------------- | -------------- |
| Implement Lighting System     | Add dynamic lighting to enhance visual effects.    | 🚧 In Progress |
| Optimize Shader Performance   | Improve shader efficiency for better performance.  | 🛠️ To Do       |
| Add User Interaction Features | Enable user controls for object manipulation.      | ✅ Completed   |
| Integrate Physics Engine      | Incorporate physics for realistic object behavior. | 📝 Planned     |

You can customize the emojis based on your preference to represent different statuses such as "To Do," "In Progress," "Completed," etc. This will help in tracking the progress of each goal visually.

---

_This README serves as a roadmap for the development of the engine. Regularly updating it will help in maintaining clarity on the project's trajectory and ensuring that all team members are aligned with the objectives._
