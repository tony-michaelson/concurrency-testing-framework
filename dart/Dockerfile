FROM dart

WORKDIR /app
COPY ./src/ /app

RUN dart pub get

RUN dart compile exe server.dart

CMD ["./server.exe"]