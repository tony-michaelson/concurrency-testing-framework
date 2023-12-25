import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'package:http/http.dart' as http;

final apiPort =
    int.parse(Platform.environment['STREAMING_SERVER_PORT'] ?? '3030');

final streamingServerHostname =
    Platform.environment['STREAMING_SERVER'] ?? '127.0.0.1';

final numberOfPrimes =
    int.parse(Platform.environment['NUMBER_OF_PRIMES'] ?? '1500');
final stringConcatSize =
    int.parse(Platform.environment['STRING_CONCAT_SIZE'] ?? '10000');
final streamSize = int.parse(Platform.environment['STREAM_SIZE'] ?? '1000000');

Future<void> main() async {
  final serverPort = int.parse(Platform.environment['PORT'] ?? '3000');

  final server = await HttpServer.bind(InternetAddress.anyIPv4, serverPort);
  print('Server is running on port ${server.port}');

  await for (final HttpRequest request in server) {
    final receivePort = ReceivePort();

    if (request.uri.path == '/hello') {
      Isolate.spawn(performHelloOperationInIsolate, receivePort.sendPort);
    } else if (request.uri.path == '/string-concat') {
      Isolate.spawn(performStringOperationInIsolate, receivePort.sendPort);
    } else if (request.uri.path == '/cpu') {
      Isolate.spawn(performMathOperationInIsolate, receivePort.sendPort);
    } else if (request.uri.path == '/api-call') {
      Isolate.spawn(simulateAPICallInIsolate, receivePort.sendPort);
    } else if (request.uri.path == '/consume') {
      Isolate.spawn(consumeStreamInIsolate, receivePort.sendPort);
    } else if (request.uri.path == '/input') {
      final requestBody = await utf8.decodeStream(request);
      final inputData = jsonDecode(requestBody);
      Isolate.spawn(walkObjectInIsolate, [receivePort.sendPort, inputData]);
    } else {
      request.response
        ..statusCode = HttpStatus.notFound
        ..headers.contentType = ContentType.text
        ..write('Not Found')
        ..close();
      continue;
    }

    receivePort.listen((message) {
      request.response
        ..statusCode = HttpStatus.ok
        ..headers.contentType = ContentType.text
        ..write(message)
        ..close();
    });
  }
}

performHelloOperationInIsolate(SendPort sendPort) {
  sendPort.send('Hello!');
}

void performStringOperationInIsolate(SendPort sendPort) {
  var result = StringBuffer();
  for (var i = 0; i < stringConcatSize; i++) {
    result.write('This is a CPU-intensive operation. ');
  }
  sendPort.send(result.toString());
}

void performMathOperationInIsolate(SendPort sendPort) async {
  final result = await computeMathOperation(numberOfPrimes);
  sendPort.send(jsonEncode(result));
}

Future<List<int>> computeMathOperation(n) async {
  Stream<int> generate() async* {
    for (var i = 2;; i++) {
      yield await Future.microtask(() => i);
    }
  }

  Stream<int> filter(StreamIterator<int> input, int prime) async* {
    while (await input.moveNext()) {
      final i = input.current;
      if (i % prime != 0) {
        yield await Future.microtask(() => i);
      }
    }
  }

  var primes = <int>[];
  var stream = StreamIterator(generate());
  for (var i = 0; i < n; i++) {
    await stream.moveNext();
    final prime = stream.current;
    primes.add(prime);
    stream = StreamIterator(filter(stream, prime));
  }

  return primes;
}

void simulateAPICallInIsolate(SendPort sendPort) async {
  final response = await http.get(Uri.parse('http://' +
      streamingServerHostname +
      ':' +
      apiPort.toString() +
      '/api-call'));
  sendPort.send(response.body);
}

void consumeStreamInIsolate(SendPort sendPort) async {
  final response = await http.get(Uri.parse('http://' +
      streamingServerHostname +
      ':' +
      apiPort.toString() +
      '/stream'));
  sendPort.send(response.body);
}

void walkObjectInIsolate(List<dynamic> args) {
  final SendPort sendPort = args[0];
  final Map<String, dynamic> obj = args[1];
  final size = walkObject(obj);
  sendPort.send("Processed Input: " + size.toString() + " elements");
}

int walkObject(Map<String, dynamic> obj, {int depth = 0}) {
  var count = 0;
  for (final key in obj.keys) {
    count++;
    final value = obj[key];
    if (value is Map<String, dynamic>) {
      count += walkObject(value, depth: depth + 1);
    }
  }
  return count;
}
