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
  StandardMaterial,
  Quaternion,
  DynamicTexture,
  MultiMaterial,
  SubMesh,
} from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
// @ts-ignore
import havokWasmUrl from "../assets/HavokPhysics.wasm?url";

const havok = await HavokPhysics({
  locateFile: () => havokWasmUrl,
});

class App {
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

    const die1MultiMat = new MultiMaterial("multiMat");
    const dieset = ["🔥", "💧", "🌱", "⛰", "⚡", "⏱"];
    dieset.forEach((str, i) => {
      const texture = new DynamicTexture(
        `tex${i}`,
        { width: 500, height: 500 },
        scene
      );
      texture.drawText(str, null, null, "300px solid Arial", "blue", "white");
      const material = new StandardMaterial(`mat${i}`, scene);
      material.diffuseTexture = texture;
      die1MultiMat.subMaterials.push(material);
    });

    const die1: Mesh = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    die1.material = die1MultiMat;
    const verticesCount = die1.getTotalVertices();
    for (let i = 0; i < die1MultiMat.subMaterials.length; i++)
      new SubMesh(i, 0, verticesCount, i * 6, 6, die1);
    const die2 = die1.clone("die2");
    const die3 = die1.clone("die3");

    const dice = [die1, die2, die3];

    const ground: Mesh = MeshBuilder.CreateBox(
      "ground",
      { width: 30, height: 0.5, depth: 30 },
      scene
    );

    window.addEventListener("deviceorientation", (ev) => {
      let x = -ev.beta;
      let y = -ev.gamma;

      console.log(x / 180, y / 180);

      ground.rotationQuaternion = Quaternion.FromEulerAngles(
        (x / 180) * Math.PI,
        0,
        (y / 180) * Math.PI
      );
    });

    dice.forEach((die, i) => {
      const dieAggregate = new PhysicsAggregate(
        die,
        PhysicsShapeType.BOX,
        { mass: 1, restitution: 0.2 },
        scene
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
      PhysicsShapeType.BOX,
      { mass: 0 },
      scene
    );
    groundAggregate.body.disablePreStep = false;

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
