import {
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@1.41.1/mod.ts";
import { DynamoDBClient } from "https://esm.sh/@aws-sdk/client-dynamodb@3.538.0";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
} from "https://esm.sh/@aws-sdk/lib-dynamodb@3.538.0";

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
  data: { roomId: string },
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  if (data.roomId) {
    [];
    const result = await ddbDocClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          id: data.roomId,
        },
      })
    );
    console.log(result);

    return {
      statusCode: 200,
      headers: { "content-type": "application/json;charset=utf8" },
      body: JSON.stringify({
        code: "S-001",
        message: "succeeded",
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
