import "https://deno.land/std@0.191.0/dotenv/load.ts";
import {
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@1.41.1/mod.ts";
import { DynamoDBClient } from "https://esm.sh/@aws-sdk/client-dynamodb@3.538.0";
import { ScanCommand } from "https://esm.sh/@aws-sdk/lib-dynamodb@3.538.0";
import { PutCommand } from "https://esm.sh/@aws-sdk/lib-dynamodb@3.538.0";
import { DynamoDBDocumentClient } from "https://esm.sh/@aws-sdk/lib-dynamodb@3.538.0";

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
  data: { playerID: string; roomKey?: string },
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  if ("playerID" in data) {
    const createdRoom = await ddbDocClient.send(
      new ScanCommand({
        TableName: tableName,
        FilterExpression: "hostPlayer = :g",
        ExpressionAttributeValues: {
          ":g": data.playerID,
        },
      })
    );
    if (createdRoom.Items && createdRoom.Items.length > 0) {
      return {
        statusCode: 200,
        headers: { "content-type": "application/json;charset=utf8" },
        body: JSON.stringify({
          code: "S-002",
          message: "already created",
          roomId: createdRoom.Items[0].id,
        }),
      };
    }

    const roomId = crypto.randomUUID();
    const roomKey = data?.roomKey ?? "";
    const result = await ddbDocClient.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          id: roomId,
          key: roomKey,
          hostPlayer: data.playerID,
          guestPlayer: "",
          hostRollLog: [],
          guestRollLog: [],
          winner: "",
        },
      })
    );

    return {
      statusCode: 200,
      headers: { "content-type": "application/json;charset=utf8" },
      body: JSON.stringify({
        code: "S-001",
        message: "succeeded",
        roomId: roomId,
      }),
    };
  }
  return {
    statusCode: 200,
    headers: { "content-type": "application/json;charset=utf8" },
    body: JSON.stringify({
      code: "E-001",
      message: "invalid data",
    }),
  };
}
