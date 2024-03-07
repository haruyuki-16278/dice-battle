import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  FreeCamera,
  HavokPlugin,
  PhysicsAggregate,
  PhysicsShapeType,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
// @ts-ignore
import havokWasmUrl from "../assets/HavokPhysics.wasm?url";

const havok = await HavokPhysics({
  locateFile: () => havokWasmUrl,
});

class App {
  px: number = 0;
  py: number = 0;

  constructor() {
    // create the canvas html element and attach it to the webpage
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.id = "gameCanvas";
    document.body.appendChild(canvas);

    // initialize babylon scene and engine
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const havokPlugin = new HavokPlugin(true, havok);
    scene.enablePhysics(new Vector3(0, -9.8, 0), havokPlugin);

    const camera: FreeCamera = new FreeCamera(
      "camera",
      new Vector3(5, 5, -10),
      scene
    );
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    const light1: HemisphericLight = new HemisphericLight(
      "light1",
      new Vector3(1, 1, 0),
      scene
    );

    const cube: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    const cubeMaterial = new StandardMaterial("boxMaterial", scene);
    cubeMaterial.diffuseColor = new Color3(0.2, 0.4, 0.8);
    cube.material = cubeMaterial;
    cube.position = new Vector3(0, 10, 0);

    const ground: Mesh = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );

    window.addEventListener("deviceorientation", (ev) => {
      let x = ev.beta;
      let y = ev.gamma;

      console.log(x / 180, y / 180);

      ground.rotate(new Vector3(1, 0, 0), ((this.px - x) / 180) * Math.PI);
      ground.rotate(new Vector3(0, 0, 1), ((this.py - y) / 180) * Math.PI);
      this.px = x;
      this.py = y;
      console.log(this.px, this.py);
    });

    const cubeAggregate = new PhysicsAggregate(
      cube,
      PhysicsShapeType.BOX,
      { mass: 1, restitution: 0.2 },
      scene
    );
    const groundAggregate = new PhysicsAggregate(
      ground,
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    );

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }
}
new App();
