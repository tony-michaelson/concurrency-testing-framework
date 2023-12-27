package com.example.plugins

import com.example.GeneratePrimes
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import java.net.URL

val stringConcatSize = System.getenv()["STRING_CONCAT_SIZE"]?.toInt() ?: 1000
val hostname = System.getenv("STREAMING_SERVER") ?: "localhost"
val portStr = System.getenv()["STREAMING_SERVER_PORT"]?.toInt() ?: 3030
val numberOfPrimes = System.getenv()["NUMBER_OF_PRIMES"]?.toInt() ?: 1500
val json = Json { allowTrailingComma = true }

fun Application.configureRouting() {
    routing {
        get("/hello") {
            call.respondText("Hello!")
        }
        get("/cpu") {
            val result = async {
                val generatePrimes = GeneratePrimes()
                generatePrimes.generatePrimesList(numberOfPrimes)
            }.await()
            call.respondText(result.toString())
        }
        get("/api-call") {
            val response = async { consumeExternalApi("http://$hostname:$portStr/api-call") }.await()
            call.respondText(response)
        }
        get("/consume") {
            val response = async { consumeExternalApi("http://$hostname:$portStr/stream") }.await()
            call.respondText(response)
        }
        get("/string-concat") {
            val result = async { performStringOperation() }.await()
            call.respondText(result)
        }
        post("/input") {
            val inputData = call.receiveText()
            val jsonObject = json.decodeFromString<JsonObject>(inputData)
            val size = async { walkObject(jsonObject) }.await()
            call.respondText("Processed Input: $size elements")
        }
    }
}

suspend fun performStringOperation(): String {
    val result = StringBuilder()
    repeat(stringConcatSize) {
        result.append("This is a CPU-intensive operation. ")
    }
    return result.toString()
}

suspend fun consumeExternalApi(url: String): String {
    return withContext(Dispatchers.IO) {
        URL(url).readText()
    }
}

tailrec fun walkObject(obj: Any, stack: ArrayDeque<Map<*, *>> = ArrayDeque(), elementCount: Int = 0): Int {
    if (obj is Map<*, *>) {
        if (stack.isEmpty()) stack.add(obj)

        var count = elementCount

        while (stack.isNotEmpty()) {
            val currentMap = stack.removeLast()
            count += currentMap.size

            for ((_, value) in currentMap) {
                if (value is Map<*, *>) {
                    stack.add(value)
                }
            }
        }

        return count
    } else {
        return elementCount
    }
}