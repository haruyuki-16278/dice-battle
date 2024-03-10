import {
  CSG,
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

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
    trayBase.position = new Vector3(0, -0.5, 0);
    const traySpace = MeshBuilder.CreateCylinder("traySpace", {
      height: 2.5,
      diameterTop: 14,
      diameterBottom: 11,
    });
    traySpace.position = new Vector3(0, 0, 0);

    const trayBaseCSG = CSG.FromMesh(trayBase);
    const traySpaceCSG = CSG.FromMesh(traySpace);
    const trayCSG = trayBaseCSG.subtract(traySpaceCSG);

    const trayTopBase = MeshBuilder.CreateCylinder("trayBase", {
      height: 3,
      diameterTop: 15,
      diameterBottom: 12,
    });
    trayTopBase.position = new Vector3(0, 6.5, 0);
    trayTopBase.rotation = new Vector3(Math.PI, 0, 0);
    const trayTopSpace = MeshBuilder.CreateCylinder("traySpace", {
      height: 2.5,
      diameterTop: 14,
      diameterBottom: 11,
    });
    trayTopSpace.position = new Vector3(0, 6, 0);
    trayTopSpace.rotation = new Vector3(Math.PI, 0, 0);
    const trayTopBaseCSG = CSG.FromMesh(trayTopBase);
    const trayTopSpaceCSG = CSG.FromMesh(trayTopSpace);
    const trayTopCSG = trayTopBaseCSG.subtract(trayTopSpaceCSG);

    const trayWallBase = MeshBuilder.CreateCylinder("trayWallBase", {
      height: 4,
      diameter: 15,
    });
    trayWallBase.position = new Vector3(0, 3, 0);
    const trayWallSpace = MeshBuilder.CreateCylinder("trayWallSpace", {
      height: 4,
      diameter: 13.75,
    });
    trayWallSpace.position = new Vector3(0, 3, 0);
    const trayWallBaseCSG = CSG.FromMesh(trayWallBase);
    const trayWallSpaceCSG = CSG.FromMesh(trayWallSpace);
    const trayWallCSG = trayWallBaseCSG.subtract(trayWallSpaceCSG);

    const tray = trayCSG
      .union(trayWallCSG)
      .union(trayTopCSG)
      .toMesh("tray", null, this.scene);
    const trayMat = new StandardMaterial("trayMat", this.scene);
    trayMat.diffuseColor = new Color3(0.9, 0.9, 0.95);
    trayMat.alpha = 0.3;
    tray.material = trayMat;

    trayBase.visibility = 0;
    traySpace.visibility = 0;
    trayTopBase.visibility = 0;
    trayTopSpace.visibility = 0;
    trayWallBase.visibility = 0;
    trayWallSpace.visibility = 0;
    return tray;
  }
}
