import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  FreeCamera,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  Quaternion,
  ArcRotateCamera,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
// @ts-ignore
import havokWasmUrl from "../assets/HavokPhysics.wasm?url";
import { DieBuilder } from "./builder/die";
import { TrayBuilder } from "./builder/tray";

const havok = await HavokPhysics({
  locateFile: () => havokWasmUrl,
});

class App {
  canvas: HTMLCanvasElement = (() => {
    // create the canvas html element and attach it to the webpage
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);
    return canvas;
  })();
  engine: Engine = new Engine(this.canvas, true);
  scene: Scene = new Scene(this.engine);
  havokPlugin = new HavokPlugin(true, havok);

  dieBuilder = new DieBuilder(this.scene);
  trayBuilder = new TrayBuilder(this.scene);

  constructor() {
    this.scene.enablePhysics(new Vector3(0, -9.8, 0), this.havokPlugin);

    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      -Math.PI / 2,
      15,
      Vector3.Zero(),
      this.scene
    );
    camera.pinchToPanMaxDistance = 10;
    // camera.setTarget(Vector3.Zero());
    camera.attachControl(this.canvas, true);
    const light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );

    const dice = this.dieBuilder.createDice(3);
    const ground: Mesh = this.trayBuilder.createTray();

    // window.addEventListener("deviceorientation", (ev) => {
    //   let x = -ev.beta;
    //   let y = -ev.gamma;

    //   console.log(x / 180, y / 180);

    //   ground.rotationQuaternion = Quaternion.FromEulerAngles(
    //     (x / 180) * Math.PI,
    //     0,
    //     (y / 180) * Math.PI
    //   );
    // });

    dice.forEach((die, i) => {
      const dieAggregate = new PhysicsAggregate(
        die,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2 },
        this.scene
      );
      dieAggregate.body.disablePreStep = false;
      dieAggregate.material.friction = 0.8;
      die.position = new Vector3(i, 10, i);
      die.rotate(new Vector3(1, 0, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 1, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 0, 1), Math.random() * 2 * Math.PI);
    });
    const groundAggregate = new PhysicsAggregate(
      ground,
      PhysicsShapeType.MESH,
      { mass: 0 },
      this.scene
    );
    groundAggregate.body.disablePreStep = false;

    window.addEventListener("keydown", (ev) => this.inspectorControl(ev));
    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  /** hide/show the Inspector */
  inspectorControl(ev: KeyboardEvent) {
    // Shift+Ctrl+Alt+I
    if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
      if (this.scene.debugLayer.isVisible()) {
        this.scene.debugLayer.hide();
      } else {
        this.scene.debugLayer.show();
      }
    }
  }
}
new App();
