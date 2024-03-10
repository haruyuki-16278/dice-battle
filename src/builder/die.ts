import {
  DynamicTexture,
  Mesh,
  MeshBuilder,
  MultiMaterial,
  Scene,
  StandardMaterial,
  SubMesh,
} from "@babylonjs/core";

export class DieBuilder {
  scene: Scene | undefined = undefined;
  constructor(scene?: Scene) {
    this.scene = scene;
  }

  createDie(): Mesh {
    const dieMultiMat = new MultiMaterial("multiMat");
    const dieset = ["🔥", "💧", "🌱", "🔥", "💧", "🌱"];
    dieset.forEach((str, i) => {
      const texture = new DynamicTexture(
        `tex${i}`,
        { width: 500, height: 500 },
        this.scene
      );
      texture.drawText(str, null, null, "300px solid Arial", "blue", "white");
      const material = new StandardMaterial(`mat${i}`, this.scene);
      material.diffuseTexture = texture;
      dieMultiMat.subMaterials.push(material);
    });

    const die: Mesh = MeshBuilder.CreateBox("die", { size: 1 }, this.scene);
    die.material = dieMultiMat;
    const verticesCount = die.getTotalVertices();
    for (let i = 0; i < dieMultiMat.subMaterials.length; i++)
      new SubMesh(i, 0, verticesCount, i * 6, 6, die);

    return die;
  }

  createDice(amount: number): Mesh[] {
    const dice = [this.createDie()];
    for (let i = 1; i < amount; i++) {
      dice.push(dice[0].clone(`die${i}`));
    }
    return dice;
  }
}
