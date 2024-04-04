ARG aws_region
ARG ecr_registry
ARG aws_access_key
ARG aws_secret_key

FROM ${ecr_registry}/my-deno-lambda:latest

ENV DENO_DIR=.deno_dir AWS_REGION=${aws_region} ACCESS=${aws_access_key} SECRET=${aws_secret_key}
COPY index.ts .
RUN deno cache --reload index.ts

CMD ["index.handler"]