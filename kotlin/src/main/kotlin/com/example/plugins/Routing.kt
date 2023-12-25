package com.example.plugins

import com.example.GeneratePrimes
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL

val stringConcatSize = System.getenv()["STRING_CONCAT_SIZE"]?.toInt() ?: 1000
val hostname = System.getenv("STREAMING_SERVER") ?: "localhost"
val portStr = System.getenv()["STREAMING_SERVER_PORT"]?.toInt() ?: 3030
val numberOfPrimes = System.getenv()["NUMBER_OF_PRIMES"]?.toInt() ?: 1500

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
            val size = async { countJsonElements(inputData) }.await()
            call.respondText("Processed Input: " + size + " elements")
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

suspend fun countJsonElements(jsonString: String): Int {
    val jsonObject = JSONObject(jsonString)
    return countJsonElementsRecursive(jsonObject)
}

fun countJsonElementsRecursive(jsonObj: JSONObject): Int {
    return countJsonElementsRecursiveHelper(jsonObj.keys().iterator(), jsonObj)
}

private tailrec fun countJsonElementsRecursiveHelper(keysIterator: Iterator<String>, jsonObj: JSONObject, count: Int = 0): Int {
    if (!keysIterator.hasNext()) {
        return count
    }

    val key = keysIterator.next()
    val value = jsonObj[key]

    val updatedCount = count + 1

    val totalCount = when (value) {
        is JSONObject -> countJsonElementsRecursiveHelper(value.keys().iterator(), value, updatedCount)
        is List<*> -> {
            var listCount = updatedCount
            for (item in value) {
                if (item is JSONObject) {
                    listCount = countJsonElementsRecursiveHelper(item.keys().iterator(), item, listCount)
                }
            }
            listCount
        }
        else -> updatedCount
    }

    return countJsonElementsRecursiveHelper(keysIterator, jsonObj, totalCount)
}
