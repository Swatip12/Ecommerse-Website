package com.ecommerce.performance;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.List;
import java.util.ArrayList;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoadTest {

    private static final String BASE_URL = "http://localhost:8080/api";
    private static final int CONCURRENT_USERS = 50;
    private static final int REQUESTS_PER_USER = 10;

    @Test
    void testProductListingPerformance() throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        ExecutorService executor = Executors.newFixedThreadPool(CONCURRENT_USERS);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        List<Long> responseTimes = new ArrayList<>();

        long startTime = System.currentTimeMillis();

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int user = 0; user < CONCURRENT_USERS; user++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                for (int request = 0; request < REQUESTS_PER_USER; request++) {
                    try {
                        long requestStart = System.currentTimeMillis();
                        
                        HttpRequest httpRequest = HttpRequest.newBuilder()
                            .uri(URI.create(BASE_URL + "/products?page=0&size=20"))
                            .GET()
                            .timeout(Duration.ofSeconds(30))
                            .build();

                        HttpResponse<String> response = client.send(httpRequest, 
                            HttpResponse.BodyHandlers.ofString());

                        long requestTime = System.currentTimeMillis() - requestStart;
                        
                        synchronized (responseTimes) {
                            responseTimes.add(requestTime);
                        }

                        if (response.statusCode() == 200) {
                            successCount.incrementAndGet();
                        } else {
                            errorCount.incrementAndGet();
                        }

                        // Small delay between requests
                        Thread.sleep(100);
                        
                    } catch (Exception e) {
                        errorCount.incrementAndGet();
                        System.err.println("Request failed: " + e.getMessage());
                    }
                }
            }, executor);
            
            futures.add(future);
        }

        // Wait for all requests to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get(5, TimeUnit.MINUTES);

        long totalTime = System.currentTimeMillis() - startTime;
        int totalRequests = CONCURRENT_USERS * REQUESTS_PER_USER;

        // Calculate statistics
        double averageResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);

        long maxResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);

        double requestsPerSecond = (double) totalRequests / (totalTime / 1000.0);
        double errorRate = (double) errorCount.get() / totalRequests * 100;

        // Print results
        System.out.println("=== Load Test Results ===");
        System.out.println("Total Requests: " + totalRequests);
        System.out.println("Successful Requests: " + successCount.get());
        System.out.println("Failed Requests: " + errorCount.get());
        System.out.println("Error Rate: " + String.format("%.2f%%", errorRate));
        System.out.println("Total Time: " + totalTime + "ms");
        System.out.println("Average Response Time: " + String.format("%.2f ms", averageResponseTime));
        System.out.println("Max Response Time: " + maxResponseTime + "ms");
        System.out.println("Requests per Second: " + String.format("%.2f", requestsPerSecond));

        // Assertions for performance requirements
        assertTrue(errorRate < 5.0, "Error rate should be less than 5%");
        assertTrue(averageResponseTime < 1000, "Average response time should be less than 1 second");
        assertTrue(requestsPerSecond > 10, "Should handle at least 10 requests per second");

        executor.shutdown();
    }

    @Test
    void testSearchPerformance() throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

        String[] searchTerms = {"laptop", "phone", "headphones", "tablet", "camera"};
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);
        List<Long> responseTimes = new ArrayList<>();

        ExecutorService executor = Executors.newFixedThreadPool(20);
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        long startTime = System.currentTimeMillis();

        for (int i = 0; i < 100; i++) {
            final String searchTerm = searchTerms[i % searchTerms.length];
            
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    long requestStart = System.currentTimeMillis();
                    
                    String requestBody = String.format(
                        "{\"keyword\":\"%s\",\"page\":0,\"size\":10}", searchTerm);
                    
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/products/search"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .timeout(Duration.ofSeconds(30))
                        .build();

                    HttpResponse<String> response = client.send(request, 
                        HttpResponse.BodyHandlers.ofString());

                    long requestTime = System.currentTimeMillis() - requestStart;
                    
                    synchronized (responseTimes) {
                        responseTimes.add(requestTime);
                    }

                    if (response.statusCode() == 200) {
                        successCount.incrementAndGet();
                    } else {
                        errorCount.incrementAndGet();
                    }
                    
                } catch (Exception e) {
                    errorCount.incrementAndGet();
                    System.err.println("Search request failed: " + e.getMessage());
                }
            }, executor);
            
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get(2, TimeUnit.MINUTES);

        long totalTime = System.currentTimeMillis() - startTime;
        
        double averageResponseTime = responseTimes.stream()
            .mapToLong(Long::longValue)
            .average()
            .orElse(0.0);

        double errorRate = (double) errorCount.get() / 100 * 100;

        System.out.println("=== Search Performance Test Results ===");
        System.out.println("Total Search Requests: 100");
        System.out.println("Successful Requests: " + successCount.get());
        System.out.println("Failed Requests: " + errorCount.get());
        System.out.println("Error Rate: " + String.format("%.2f%%", errorRate));
        System.out.println("Average Response Time: " + String.format("%.2f ms", averageResponseTime));

        // Search should be fast and reliable
        assertTrue(errorRate < 2.0, "Search error rate should be less than 2%");
        assertTrue(averageResponseTime < 500, "Search should respond within 500ms on average");

        executor.shutdown();
    }

    @Test
    void testDatabaseConnectionPool() throws Exception {
        // Test database connection pool under load
        ExecutorService executor = Executors.newFixedThreadPool(100);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger errorCount = new AtomicInteger(0);

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < 200; i++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    HttpClient client = HttpClient.newHttpClient();
                    
                    HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(BASE_URL + "/products/1"))
                        .GET()
                        .timeout(Duration.ofSeconds(10))
                        .build();

                    HttpResponse<String> response = client.send(request, 
                        HttpResponse.BodyHandlers.ofString());

                    if (response.statusCode() == 200) {
                        successCount.incrementAndGet();
                    } else {
                        errorCount.incrementAndGet();
                    }
                    
                } catch (Exception e) {
                    errorCount.incrementAndGet();
                }
            }, executor);
            
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get(1, TimeUnit.MINUTES);

        double errorRate = (double) errorCount.get() / 200 * 100;

        System.out.println("=== Database Connection Pool Test ===");
        System.out.println("Total Requests: 200");
        System.out.println("Successful: " + successCount.get());
        System.out.println("Failed: " + errorCount.get());
        System.out.println("Error Rate: " + String.format("%.2f%%", errorRate));

        // Database should handle concurrent connections well
        assertTrue(errorRate < 1.0, "Database connection error rate should be less than 1%");

        executor.shutdown();
    }
}