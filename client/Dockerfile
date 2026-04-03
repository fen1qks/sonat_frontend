FROM node:22.14.0-bookworm-slim AS dev

ARG UID=1000
RUN userdel node && useradd sonat_bridge --uid ${UID} -l --create-home && mkdir /client && chown sonat_bridge /client

WORKDIR /client
USER sonat_bridge
