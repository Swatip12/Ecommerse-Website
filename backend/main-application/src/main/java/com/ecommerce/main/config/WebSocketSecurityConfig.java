package com.ecommerce.main.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            // Allow connection to WebSocket endpoints
            .simpDestMatchers("/app/**").authenticated()
            .simpDestMatchers("/topic/**").authenticated()
            .simpDestMatchers("/queue/**").authenticated()
            .simpDestMatchers("/user/**").authenticated()
            // Admin-only destinations
            .simpDestMatchers("/app/admin/**").hasRole("ADMIN")
            .simpDestMatchers("/topic/admin/**").hasRole("ADMIN")
            // Allow subscription to public topics
            .simpSubscribeDestMatchers("/topic/public/**").permitAll()
            // Default: require authentication
            .anyMessage().authenticated();
    }

    @Override
    protected boolean sameOriginDisabled() {
        // Disable CSRF for WebSocket connections
        return true;
    }
}