import { CSG, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

export class TrayBuilder {
  scene: Scene | undefined = undefined;
  constructor(scene?: Scene) {
    this.scene = scene;
  }

  createTray(): Mesh {
    const trayBase = MeshBuilder.CreateCylinder("trayBase", {
      height: 3,
      diameterTop: 15,
      diameterBottom: 12,
    });
    const traySpace = MeshBuilder.CreateCylinder("traySpace", {
      height: 2.5,
      diameterTop: 14,
      diameterBottom: 11,
    });
    traySpace.position = new Vector3(0, 0.5, 0);

    const trayBaseCSG = CSG.FromMesh(trayBase);
    const traySpaceCSG = CSG.FromMesh(traySpace);

    let booleanCSG = trayBaseCSG.subtract(traySpaceCSG);

    let tray = booleanCSG.toMesh("tray", null, this.scene);

    trayBase.visibility = 0;
    traySpace.visibility = 0;
    return tray;
  }
}
