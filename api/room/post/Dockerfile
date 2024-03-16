FROM denoland/deno-lambda:1.41.1

COPY index.ts .
RUN deno cache index.ts

CMD ["index.handler"]
