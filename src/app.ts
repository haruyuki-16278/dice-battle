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
  IPhysicsCollisionEvent,
  Observer,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
// @ts-ignore
import havokWasmUrl from "../assets/HavokPhysics.wasm?url";
import { DieBuilder, dieset } from "./builder/die";
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

  camera: ArcRotateCamera;
  light: HemisphericLight;
  dice: Mesh[];
  diceAggregate: PhysicsAggregate[];

  collisionObservable = this.havokPlugin.onCollisionObservable;
  collisionObserver: Observer<IPhysicsCollisionEvent> = undefined;
  collisionTimeout: number | undefined = undefined;

  constructor() {
    this.initWorld();
    this.scene.enablePhysics(new Vector3(0, -9.8, 0), this.havokPlugin);
    this.initTray();
    this.initDice();

    this.collisionObserver = this.collisionObservable.add((ev) => {
      if (ev.type === "COLLISION_STARTED") {
        if (this.collisionTimeout) {
          window.clearTimeout(this.collisionTimeout);
        }
        this.collisionTimeout = window.setTimeout(() => {
          this.collisionObservable.remove(this.collisionObserver);
          this.fixStatus();
        }, 2000);
      }
    });

    window.addEventListener("deviceorientation", (ev) => {
      this.camera.beta = (ev.beta / 180) * Math.PI;
    });
    window.addEventListener("devicemotion", (ev) =>
      this.impulseDiceFromMotion(ev)
    );
    window.addEventListener("keydown", (ev) => this.inspectorControl(ev));

    // run the main render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  initWorld() {
    this.camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 2,
      -Math.PI / 2,
      30,
      new Vector3(0, 3, 0),
      this.scene
    );
    this.camera.pinchToPanMaxDistance = 10;
    this.camera.attachControl(this.canvas, true);
    this.light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      this.scene
    );
  }

  initTray() {
    const tray: Mesh = this.trayBuilder.createTray();
    const trayAggregate = new PhysicsAggregate(
      tray,
      PhysicsShapeType.MESH,
      { mass: 0 },
      this.scene
    );
    trayAggregate.body.disablePreStep = false;
    trayAggregate.body.setCollisionCallbackEnabled(true);
    trayAggregate.material.friction = 5;
  }

  initDice() {
    this.dice = this.dieBuilder.createDice(3);
    this.diceAggregate = [];
    this.dice.forEach((die, i) => {
      const dieAggregate = new PhysicsAggregate(
        die,
        PhysicsShapeType.BOX,
        { mass: 5, restitution: 0.6 },
        this.scene
      );
      dieAggregate.body.disablePreStep = false;
      dieAggregate.body.setCollisionCallbackEnabled(true);
      dieAggregate.material.friction = 1;
      this.diceAggregate.push(dieAggregate);
      die.position = new Vector3(1 - i, 6, 1 - i);
      die.rotate(new Vector3(1, 0, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 1, 0), Math.random() * 2 * Math.PI);
      die.rotate(new Vector3(0, 0, 1), Math.random() * 2 * Math.PI);
    });
  }

  fixStatus() {
    const faces = [];
    this.dice.forEach((die, i) => {
      const eulerRotation = die.rotationQuaternion.toEulerAngles();
      const rotation = new Vector3(
        this.roundAngleToHarfPI((eulerRotation.x * 180) / Math.PI + 180),
        (eulerRotation.y * 180) / Math.PI + 180,
        this.roundAngleToHarfPI((eulerRotation.z * 180) / Math.PI + 180)
      );
      faces.push(dieset[this.dieBuilder.getDieTopFromRotation(rotation) - 1]);
      this.diceAggregate[i].body.setMassProperties({ mass: 0 });
      window.removeEventListener("devicemotion", (ev) =>
        this.impulseDiceFromMotion(ev)
      );
    });
    console.log(faces);
  }

  impulseDiceFromMotion(ev: DeviceMotionEvent) {
    const xMagnitude = Math.round(ev.acceleration.x);
    const yMagnitude = Math.round(ev.acceleration.y);
    const zMagnitude = Math.round(ev.acceleration.z);

    this.diceAggregate.forEach((dieAggregate, i) => {
      dieAggregate.body.applyImpulse(
        new Vector3(xMagnitude, yMagnitude, zMagnitude),
        this.dice[i].position
      );
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

  roundAngleToHarfPI(eulerRotation: number) {
    if (eulerRotation > 45 && eulerRotation <= 135) {
      return 90;
    } else if (eulerRotation > 135 && eulerRotation <= 225) {
      return 180;
    } else if (eulerRotation > 225 && eulerRotation <= 315) {
      return 270;
    } else {
      return 0;
    }
  }
}
new App();
