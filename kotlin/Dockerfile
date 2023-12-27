FROM gradle:8.5.0-jdk21-alpine

WORKDIR /app
COPY . /app

RUN gradle buildFatJar
RUN mv build/libs/ktor-sample-all.jar server.jar

CMD ["java", "-Xmx900m", "-jar", "server.jar"]