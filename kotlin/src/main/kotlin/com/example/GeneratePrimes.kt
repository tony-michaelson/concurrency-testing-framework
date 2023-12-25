package com.example

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.cancelChildren
import kotlinx.coroutines.channels.ReceiveChannel
import kotlinx.coroutines.channels.produce
import kotlinx.coroutines.runBlocking

class GeneratePrimes {
    fun generatePrimesList(n: Int): List<Int> = runBlocking {
        val primeList = mutableListOf<Int>()
        var ch = generate()
        repeat(n) {
            val prime = ch.receive()
            primeList.add(prime)
            val chNext = filter(ch, prime)
            ch = chNext
        }
        coroutineContext.cancelChildren()
        primeList
    }

    fun CoroutineScope.generate(): ReceiveChannel<Int> = produce {
        var i = 2
        while (true) {
            send(i++)
        }
    }

    fun CoroutineScope.filter(channelIn: ReceiveChannel<Int>, prime: Int): ReceiveChannel<Int> =
        produce {
            for (i in channelIn) {
                if (i % prime != 0) {
                    send(i)
                }
            }
        }
}
