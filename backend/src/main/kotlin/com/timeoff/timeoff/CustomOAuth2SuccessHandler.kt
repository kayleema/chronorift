package com.timeoff.timeoff

import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.stereotype.Component
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

@Component
class CustomOAuth2SuccessHandler(private val userRepository: UserRepository) : AuthenticationSuccessHandler {

    override fun onAuthenticationSuccess(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        val user = authentication.principal as OAuth2User
        val userId = user.getAttribute<String>("sub") ?: user.name
        val userName = user.getAttribute<String>("name") ?: user.getAttribute<String>("email") ?: userId

        // Check if user exists, if not create a new user record
        if (!userRepository.existsById(userId)) {
            val newUser = User(id = userId, name = userName)
            userRepository.save(newUser)
        } else {
            // Update existing user name if it has changed
            userRepository.findById(userId).ifPresent { existingUser ->
                if (existingUser.name != userName) {
                    val updatedUser = existingUser.copy(name = userName)
                    userRepository.save(updatedUser)
                }
            }
        }

        // Redirect to the default success URL
        response.sendRedirect("/api/vacation")
    }
}
