package com.example

import com.example.plugins.configureRouting
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

fun main() {
    val PORT = System.getenv("PORT") ?: "3000"
    embeddedServer(Netty, port = PORT.toInt(), host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureRouting()
}
