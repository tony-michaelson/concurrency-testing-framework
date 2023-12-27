package com.example

import com.example.plugins.configureRouting
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    val PORT = System.getenv("PORT") ?: "3000"
    val workerGroupSizeEnv = System.getenv("WORKER_GROUP_SIZE")
    val callGroupSizeEnv = System.getenv("CALL_GROUP_SIZE")
    val workerGroupSize = workerGroupSizeEnv?.toIntOrNull() ?: 16
    val callGroupSize = callGroupSizeEnv?.toIntOrNull() ?: 16

    embeddedServer(Netty, port = PORT.toInt(), host = "0.0.0.0", module = Application::module, configure = {
        workerGroupSize
        callGroupSize
    })
        .start(wait = true)
}

fun Application.module() {
    configureRouting()
}
