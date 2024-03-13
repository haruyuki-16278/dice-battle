import {
  DynamicTexture,
  Mesh,
  MeshBuilder,
  MultiMaterial,
  Scene,
  StandardMaterial,
  SubMesh,
  Vector3,
} from "@babylonjs/core";

export const dieset = ["🔥", "💧", "🌱", "🔥", "💧", "🌱"];
// export const dieset = ["1", "2", "3", "4", "5", "6"];

export class DieBuilder {
  scene: Scene | undefined = undefined;
  constructor(scene?: Scene) {
    this.scene = scene;
  }

  createDie(): Mesh {
    const dieMultiMat = new MultiMaterial("multiMat");
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

  getDieTopFromRotation(rotation: Vector3): number {
    const diceTable =
      rotation.x === 0
        ? [5, 3, 6, 4]
        : rotation.x === 90
        ? [2, 3, 1, 4]
        : rotation.x === 180
        ? [6, 4, 5, 3]
        : // rotation.x === 270
          [1, 3, 2, 4];
    return diceTable[Math.round(rotation.z / 90)];
  }
}
