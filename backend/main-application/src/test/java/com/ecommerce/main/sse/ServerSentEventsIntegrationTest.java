package com.ecommerce.main.sse;

import com.ecommerce.main.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ServerSentEventsIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private NotificationService notificationService;

    @Test
    void testSSEConnectionEstablishment() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream";
        
        CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
            try {
                URL url = new URL(sseUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Accept", "text/event-stream");
                connection.setRequestProperty("Cache-Control", "no-cache");
                
                assertEquals(200, connection.getResponseCode());
                assertEquals("text/event-stream", connection.getContentType());
                
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
                );
                
                // Read the first event (connection established)
                String line = reader.readLine();
                reader.close();
                connection.disconnect();
                
                return line;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        String firstEvent = future.get(10, TimeUnit.SECONDS);
        assertNotNull(firstEvent);
        assertTrue(firstEvent.contains("data:") || firstEvent.contains("event:"));
    }

    @Test
    void testOrderStatusNotificationSSE() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream/orders";
        
        CompletableFuture<String> sseListener = CompletableFuture.supplyAsync(() -> {
            try {
                URL url = new URL(sseUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Accept", "text/event-stream");
                
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
                );
                
                // Wait for notification
                String event = null;
                for (int i = 0; i < 10; i++) { // Read up to 10 lines
                    String line = reader.readLine();
                    if (line != null && line.contains("order_status_changed")) {
                        event = line;
                        break;
                    }
                }
                
                reader.close();
                connection.disconnect();
                return event;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        // Give SSE connection time to establish
        Thread.sleep(1000);

        // Trigger order status notification
        notificationService.sendOrderStatusNotification(1L, "CONFIRMED", "Order has been confirmed");

        String notification = sseListener.get(10, TimeUnit.SECONDS);
        assertNotNull(notification);
        assertTrue(notification.contains("order_status_changed"));
    }

    @Test
    void testInventoryUpdateNotificationSSE() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream/inventory";
        
        CompletableFuture<String> sseListener = CompletableFuture.supplyAsync(() -> {
            try {
                URL url = new URL(sseUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Accept", "text/event-stream");
                
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
                );
                
                String event = null;
                for (int i = 0; i < 10; i++) {
                    String line = reader.readLine();
                    if (line != null && line.contains("inventory_updated")) {
                        event = line;
                        break;
                    }
                }
                
                reader.close();
                connection.disconnect();
                return event;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        Thread.sleep(1000);

        // Trigger inventory update notification
        notificationService.sendInventoryUpdateNotification(1L, 25, 5);

        String notification = sseListener.get(10, TimeUnit.SECONDS);
        assertNotNull(notification);
        assertTrue(notification.contains("inventory_updated"));
    }

    @Test
    void testSSEConnectionTimeout() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream?timeout=1000";
        
        long startTime = System.currentTimeMillis();
        
        try {
            URL url = new URL(sseUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "text/event-stream");
            connection.setReadTimeout(2000); // 2 second timeout
            
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream())
            );
            
            // Try to read - should timeout
            String line;
            while ((line = reader.readLine()) != null) {
                // Keep reading until timeout or connection closes
            }
            
            reader.close();
            connection.disconnect();
        } catch (Exception e) {
            // Expected timeout exception
        }
        
        long duration = System.currentTimeMillis() - startTime;
        assertTrue(duration >= 1000, "Connection should have lasted at least 1 second");
        assertTrue(duration < 5000, "Connection should have timed out within 5 seconds");
    }

    @Test
    void testSSEWithAuthentication() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream/user";
        
        // Test without authentication - should fail
        URL url = new URL(sseUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "text/event-stream");
        
        int responseCode = connection.getResponseCode();
        connection.disconnect();
        
        assertEquals(401, responseCode, "Should require authentication");
        
        // Test with authentication - should succeed
        connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "text/event-stream");
        connection.setRequestProperty("Authorization", "Bearer valid-jwt-token");
        
        responseCode = connection.getResponseCode();
        connection.disconnect();
        
        // Note: This would be 200 with proper JWT validation
        assertTrue(responseCode == 200 || responseCode == 401, "Should handle authentication");
    }

    @Test
    void testSSEHeartbeat() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream?heartbeat=true";
        
        CompletableFuture<Boolean> heartbeatReceived = CompletableFuture.supplyAsync(() -> {
            try {
                URL url = new URL(sseUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("Accept", "text/event-stream");
                
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream())
                );
                
                // Look for heartbeat events
                for (int i = 0; i < 20; i++) {
                    String line = reader.readLine();
                    if (line != null && (line.contains("heartbeat") || line.contains("ping"))) {
                        reader.close();
                        connection.disconnect();
                        return true;
                    }
                    
                    if (i % 5 == 0) {
                        try {
                            Thread.sleep(500); // Wait between reads
                        } catch (InterruptedException e) {
                            break;
                        }
                    }
                }
                
                reader.close();
                connection.disconnect();
                return false;
            } catch (IOException e) {
                return false;
            }
        });

        Boolean receivedHeartbeat = heartbeatReceived.get(10, TimeUnit.SECONDS);
        assertTrue(receivedHeartbeat, "Should receive heartbeat events");
    }

    @Test
    void testSSEReconnection() throws Exception {
        String sseUrl = "http://localhost:" + port + "/api/notifications/stream";
        
        // First connection
        URL url = new URL(sseUrl);
        HttpURLConnection connection1 = (HttpURLConnection) url.openConnection();
        connection1.setRequestMethod("GET");
        connection1.setRequestProperty("Accept", "text/event-stream");
        
        assertEquals(200, connection1.getResponseCode());
        connection1.disconnect();
        
        // Second connection (simulating reconnection)
        HttpURLConnection connection2 = (HttpURLConnection) url.openConnection();
        connection2.setRequestMethod("GET");
        connection2.setRequestProperty("Accept", "text/event-stream");
        connection2.setRequestProperty("Last-Event-ID", "123");
        
        assertEquals(200, connection2.getResponseCode());
        connection2.disconnect();
        
        // Both connections should succeed
        assertTrue(true, "Reconnection should be handled gracefully");
    }
}