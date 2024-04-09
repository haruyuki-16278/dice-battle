#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run
import "https://deno.land/std@0.191.0/dotenv/load.ts";
import { env } from "https://deno.land/std@0.61.0/node/process.ts";
import * as cmd from "https://deno.land/x/cmd@v1.2.0/mod.ts";

const program = new cmd.Command("./tools.ts");
program.version("0.0.1");

const DENO_LAMBDA_VERSION = "1.41.1";

const chdirApiRoute = () => {
  if (typeof import.meta.dirname !== "string") {
    console.error("error: invalid dirname");
    Deno.exit(1);
  }
  Deno.chdir(import.meta.dirname);
};

const indexTs = (handlerName: string): string => `// generated by script
import {
  APIGatewayProxyResultV2,
  Context,
} from "https://deno.land/x/lambda@${DENO_LAMBDA_VERSION}/mod.ts";

// deno-lint-ignore require-await
export async function ${handlerName}(
  data: {},
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json;charset=utf8" },
    body: JSON.stringify({
      code: "E-001",
      message: "invalid data",
    }),
  };
}
`;
const dockerfile = (handlerName: string) => `ARG aws_region
ARG ecr_registry
ARG aws_access_key
ARG aws_secret_key

FROM \${ecr_registry}/my-deno-lambda:latest

ENV DENO_DIR=.deno_dir AWS_REGION=\${aws_region} ACCESS=\${aws_access_key} SECRET=\${aws_secret_key}
COPY index.ts .
RUN deno cache --reload index.ts

CMD ["index.${handlerName}"]

`;

program
  .command("gen <route> <method> [handler]")
  .description("generate api function set", {
    "<route>": "required. separated with / is also supported.",
    "<method>": "required. ex.) get, post, put, delete... etc.",
    "[handler]": "handler name, default: handler",
  })
  .action(async (route: string, method: string, handler?: string) => {
    chdirApiRoute();

    const createRepoCommand = new Deno.Command("aws", {
      args: [
        "ecr",
        "create-repository",
        "--repository-name",
        `${method}-${route}-dice-battle`,
      ],
    });
    const createRepoProcess = createRepoCommand.spawn();

    const { success } = await createRepoProcess.output();
    if (!success) {
      console.error("create repository failed");
      Deno.exit(1);
    }

    const dir = `${route}/${method}`;
    await Deno.mkdir(dir, { recursive: true });
    await Deno.writeTextFile(`${dir}/index.ts`, indexTs(handler ?? "handler"));
    await Deno.writeTextFile(
      `${dir}/Dockerfile`,
      dockerfile(handler ?? "handler")
    );
    await Deno.symlink(".env", `${dir}/.env`);

    console.log("generate success!");
  });

program
  .command("upload <route> <method>")
  .action(async (route: string, method: string) => {
    chdirApiRoute();
    // https://docs.deno.com/runtime/tutorials/subprocess

    const key = Deno.env.get("ACCESS");
    const secret = Deno.env.get("SECRET");
    const region = Deno.env.get("AWS_REGION");
    const registry = Deno.env.get("ECR_REGISTRY");
    if (!region || !registry) {
      console.error("invalid region. please check dotenv.");
      Deno.exit(1);
    }

    const getPassCommand = new Deno.Command("aws", {
      args: ["ecr", "get-login-password", "--region", region],
      stdout: "piped",
    });
    const dockerLoginCommand = new Deno.Command("docker", {
      args: ["login", "--username", "AWS", "--password-stdin", registry],
      stdin: "piped",
    });

    const getPassProcess = getPassCommand.spawn();
    const dockerLoginProcess = dockerLoginCommand.spawn();

    getPassProcess.stdout.pipeTo(dockerLoginProcess.stdin);

    if (!(await dockerLoginProcess.output()).success) {
      console.error("login failed");
      Deno.exit(1);
    }

    const imageName = `${method}-${route}-dice-battle`;

    const buildCommand = new Deno.Command("docker", {
      args: [
        "buildx",
        "build",
        "--tag",
        imageName,
        "--build-arg",
        `aws_region=${region}`,
        "--build-arg",
        `ecr_registry=${registry}`,
        "--build-arg",
        `aws_access_key=${key}`,
        "--build-arg",
        `aws_secret_key=${secret}`,
        `./${route}/${method}`,
      ],
    });
    const buildProcess = buildCommand.spawn();

    if (!(await buildProcess.output()).success) {
      console.error("build failed");
      Deno.exit(1);
    }

    const tagCommand = new Deno.Command("docker", {
      args: ["tag", `${imageName}:latest`, `${registry}/${imageName}:latest`],
    });
    const tagProcess = tagCommand.spawn();
    if (!(await tagProcess.output()).success) {
      console.error("tag failed");
      Deno.exit(1);
    }

    const pushCommand = new Deno.Command("docker", {
      args: ["push", `${registry}/${imageName}:latest`],
    });
    const pushProcess = pushCommand.spawn();
    if (!(await pushProcess.output()).success) {
      console.error("push failed");
      Deno.exit(1);
    }

    console.log("upload success!");
  });

program.parse(Deno.args);
