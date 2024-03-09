import { Mesh, MeshBuilder, Scene } from "@babylonjs/core";

export class TrayBuilder {
  scene: Scene | undefined = undefined;
  constructor(scene?: Scene) {
    this.scene = scene;
  }

  createTray(): Mesh {
    const tray = MeshBuilder.CreateBox(
      "tray",
      { width: 30, height: 0.5, depth: 30 },
      this.scene
    );
    return tray;
  }
}
