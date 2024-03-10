import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  Mesh,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
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
      30,
      new Vector3(0, 3, 0),
      this.scene
    );
    camera.pinchToPanMaxDistance = 10;
    camera.attachControl(this.canvas, true);
    const light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      this.scene
    );

    const dice = this.dieBuilder.createDice(3);
    const diceAggregate: PhysicsAggregate[] = [];
    dice.forEach((die, i) => {
      const dieAggregate = new PhysicsAggregate(
        die,
        PhysicsShapeType.BOX,
        { mass: 5, restitution: 0.6 },
        this.scene
      );
      dieAggregate.body.disablePreStep = false;
      dieAggregate.material.friction = 0.8;
      diceAggregate.push(dieAggregate);
      die.position = new Vector3(1 - i, 6, 1 - i);
      die.rotate(new Vector3(1, 0, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 1, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 0, 1), Math.random() * 2 * Math.PI);
    });

    const ground: Mesh = this.trayBuilder.createTray();
    const groundAggregate = new PhysicsAggregate(
      ground,
      PhysicsShapeType.MESH,
      { mass: 0 },
      this.scene
    );
    groundAggregate.body.disablePreStep = false;

    window.addEventListener("deviceorientation", (ev) => {
      let x = -ev.beta;
      let y = -ev.gamma;
      camera.beta = (ev.beta / 180) * Math.PI;
    });

    window.addEventListener("devicemotion", (ev) => {
      const xMagnitude = Math.round(ev.acceleration.x);
      const yMagnitude = Math.round(ev.acceleration.y);
      const zMagnitude = Math.round(ev.acceleration.z);

      diceAggregate.forEach((dieAggregate, i) => {
        dieAggregate.body.applyImpulse(
          new Vector3(xMagnitude, yMagnitude, zMagnitude),
          dice[i].position
        );
      });
    });

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
