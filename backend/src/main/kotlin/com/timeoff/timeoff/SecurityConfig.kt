package com.timeoff.timeoff

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
@Profile("!test")
class SecurityConfig(private val userRepository: UserRepository) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { csrf ->
                csrf.ignoringRequestMatchers("/api/**")
            }
            .authorizeHttpRequests { authz ->
                authz
                    .requestMatchers("/api/auth/status").permitAll()
                    .requestMatchers("/api/vacation/**").authenticated()
                    .anyRequest().permitAll()
            }
            .oauth2Login { oauth2 ->
                oauth2
                    .successHandler(CustomOAuth2SuccessHandler(userRepository))
            }
            .logout { logout ->
                logout
                    .logoutSuccessUrl("/")
            }
        return http.build()
    }
}
