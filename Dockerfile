FROM node:24.16.0-alpine3.23 AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

FROM node:24.16.0-alpine3.23 AS production
WORKDIR /app
RUN addgroup -S farm2fork && adduser -S farm2fork -G farm2fork
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/public ./public
COPY --from=build --chown=farm2fork:farm2fork /app/.next/standalone ./
COPY --from=build --chown=farm2fork:farm2fork /app/.next/static ./.next/static

USER farm2fork
EXPOSE 3000
CMD ["node", "server.js"]
