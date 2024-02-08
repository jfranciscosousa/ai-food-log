ARG NODE_VERSION=20.8.1
FROM node:${NODE_VERSION}-slim as base

ENV NODE_ENV production
ENV SECURE_AUTH_COOKIE true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod=false --frozen-lockfile --ignore-scripts

ADD prisma .
RUN npx prisma generate

ADD . .
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
EXPOSE 8000
CMD [ "pnpm", "start" ]
