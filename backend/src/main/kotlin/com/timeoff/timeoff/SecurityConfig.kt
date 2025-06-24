package com.timeoff.timeoff

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.config.Customizer
import org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter
import org.springframework.security.config.annotation.web.invoke

@Configuration
@EnableWebSecurity
@Profile("!test")
class SecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { csrf ->
                csrf.ignoringRequestMatchers("/api/**")
            }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/api/vacation/**").authenticated()
                    .anyRequest().permitAll()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .defaultSuccessUrl("/api/vacation", true)
            }
            .logout { logout ->
                logout
                    .logoutSuccessUrl("/")
            }
        return http.build()
    }
}
