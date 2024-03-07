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
} from "@babylonjs/core";

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

    const camera: FreeCamera = new FreeCamera(
      "camera",
      new Vector3(0, 5, -10),
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
    cube.position = new Vector3(0, 2, 0);
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
    });

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
