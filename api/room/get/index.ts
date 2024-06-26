import "https://deno.land/std@0.191.0/dotenv/load.ts";
import {
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@1.41.1/mod.ts";
import { DynamoDBClient } from "https://esm.sh/@aws-sdk/client-dynamodb@3.538.0";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "https://esm.sh/@aws-sdk/lib-dynamodb@3.538.0";

interface DiceBattleRoomTableColumn {
  id: string;
  key?: string;
  hostPlayer: string;
  hostRoll: string[];
  guestPlayer: string;
  guestRoll: string[];
  winner: string;
}

const key = Deno.env.get("ACCESS");
const secret = Deno.env.get("SECRET");

if (!key || !secret) {
  console.error("credentials unset");
  Deno.exit(1);
}

const ddbClient = new DynamoDBClient({
  region: Deno.env.get("AWS_REGION"),
  credentials: {
    accessKeyId: key,
    secretAccessKey: secret,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = "dice-battle";

// deno-lint-ignore require-await
export async function handler(
  data: { key: string; roomId: string },
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  console.log(data);
  if (data.roomId && data.roomId !== "") {
    const scan = await ddbDocClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "id = :g",
        ExpressionAttributeValues: {
          ":g": data.roomId,
        },
      })
    );
    return {
      statusCode: 200,
      headers: { "content-type": "application/json;charset=utf8" },
      body: JSON.stringify(scan.Items),
    };
  }
  const scan = await ddbDocClient.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: "guestPlayer = :g",
      ExpressionAttributeValues: {
        ":g": "",
      },
    })
  );
  const items = (scan.Items as DiceBattleRoomTableColumn[]).filter((room) => {
    if (data.key !== "") return room.guestPlayer === "";
    else return room.guestPlayer === "" && room.key === data.key;
  });
  items.forEach((room) => delete room.key);
  if (items.length > 0) {
    return {
      statusCode: 200,
      headers: {
        "content-type": "applicaiton/json;charset=utf8",
      },
      body: JSON.stringify(items),
    };
  }
  return {
    statusCode: 200,
    headers: { "content-type": "application/json;charset=utf8" },
    body: JSON.stringify([]),
  };
}
