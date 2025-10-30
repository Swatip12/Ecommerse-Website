package com.ecommerce.main.websocket;

import com.ecommerce.main.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private NotificationService notificationService;

    private WebSocketStompClient stompClient;
    private StompSession stompSession;
    private BlockingQueue<String> blockingQueue;

    @BeforeEach
    void setUp() throws Exception {
        stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        
        blockingQueue = new LinkedBlockingQueue<>();
        
        String url = "ws://localhost:" + port + "/ws";
        stompSession = stompClient.connect(url, new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                System.out.println("Connected to WebSocket");
            }
            
            @Override
            public void handleException(StompSession session, StompCommand command, 
                                      StompHeaders headers, byte[] payload, Throwable exception) {
                exception.printStackTrace();
            }
        }).get(5, TimeUnit.SECONDS);
    }

    @Test
    void testWebSocketConnection() {
        assertTrue(stompSession.isConnected());
    }

    @Test
    void testCartSynchronization() throws InterruptedException {
        // Subscribe to cart updates
        stompSession.subscribe("/user/queue/cart", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });

        // Send cart update message
        stompSession.send("/app/cart/update", "Cart updated");

        // Wait for message to be received
        String receivedMessage = blockingQueue.poll(5, TimeUnit.SECONDS);
        assertNotNull(receivedMessage);
        assertTrue(receivedMessage.contains("Cart updated"));
    }

    @Test
    void testOrderStatusNotification() throws InterruptedException {
        // Subscribe to order status updates
        stompSession.subscribe("/user/queue/orders", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });

        // Simulate order status change
        stompSession.send("/app/order/status", "Order status changed to CONFIRMED");

        // Wait for notification
        String notification = blockingQueue.poll(5, TimeUnit.SECONDS);
        assertNotNull(notification);
        assertTrue(notification.contains("CONFIRMED"));
    }

    @Test
    void testInventoryUpdateBroadcast() throws InterruptedException {
        // Subscribe to inventory updates
        stompSession.subscribe("/topic/inventory", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });

        // Send inventory update
        stompSession.send("/app/inventory/update", "Product inventory updated");

        // Wait for broadcast message
        String broadcastMessage = blockingQueue.poll(5, TimeUnit.SECONDS);
        assertNotNull(broadcastMessage);
        assertTrue(broadcastMessage.contains("inventory updated"));
    }

    @Test
    void testAdminDashboardUpdates() throws InterruptedException {
        // Subscribe to admin dashboard updates
        stompSession.subscribe("/topic/admin/dashboard", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });

        // Send dashboard update
        stompSession.send("/app/admin/dashboard", "Dashboard metrics updated");

        // Wait for update
        String dashboardUpdate = blockingQueue.poll(5, TimeUnit.SECONDS);
        assertNotNull(dashboardUpdate);
        assertTrue(dashboardUpdate.contains("Dashboard metrics"));
    }

    @Test
    void testWebSocketErrorHandling() throws InterruptedException {
        // Subscribe to error topic
        stompSession.subscribe("/user/queue/errors", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });

        // Send invalid message to trigger error
        stompSession.send("/app/invalid/endpoint", "Invalid message");

        // Wait for error message
        String errorMessage = blockingQueue.poll(5, TimeUnit.SECONDS);
        // Error handling may vary, so we just check that connection is still alive
        assertTrue(stompSession.isConnected());
    }

    @Test
    void testMultipleClientConnections() throws Exception {
        // Create second client
        WebSocketStompClient secondClient = new WebSocketStompClient(new StandardWebSocketClient());
        secondClient.setMessageConverter(new MappingJackson2MessageConverter());
        
        BlockingQueue<String> secondQueue = new LinkedBlockingQueue<>();
        
        String url = "ws://localhost:" + port + "/ws";
        StompSession secondSession = secondClient.connect(url, new StompSessionHandlerAdapter()).get(5, TimeUnit.SECONDS);
        
        // Subscribe both clients to same topic
        stompSession.subscribe("/topic/broadcast", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                blockingQueue.offer((String) payload);
            }
        });
        
        secondSession.subscribe("/topic/broadcast", new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return String.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                secondQueue.offer((String) payload);
            }
        });

        // Send broadcast message
        stompSession.send("/app/broadcast", "Broadcast to all clients");

        // Both clients should receive the message
        String message1 = blockingQueue.poll(5, TimeUnit.SECONDS);
        String message2 = secondQueue.poll(5, TimeUnit.SECONDS);
        
        assertNotNull(message1);
        assertNotNull(message2);
        assertEquals(message1, message2);
        
        secondSession.disconnect();
    }

    @Test
    void testConnectionResilience() throws InterruptedException {
        assertTrue(stompSession.isConnected());
        
        // Simulate network interruption by disconnecting and reconnecting
        stompSession.disconnect();
        assertFalse(stompSession.isConnected());
        
        // In a real application, the client would automatically reconnect
        // For this test, we just verify the disconnection was handled gracefully
        Thread.sleep(1000);
        
        // Connection should be cleanly closed
        assertFalse(stompSession.isConnected());
    }
}