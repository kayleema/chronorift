package com.timeoff.timeoff

import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController {

    @GetMapping("/status")
    fun getAuthStatus(authentication: Authentication?): ResponseEntity<Map<String, Any>> {
        return if (authentication != null && authentication.isAuthenticated) {
            ResponseEntity.ok(
                mapOf(
                    "authenticated" to true,
                    "user" to authentication.name
                )
            )
        } else {
            ResponseEntity.status(401).body(
                mapOf(
                    "authenticated" to false,
                    "loginUrl" to "/oauth2/authorization/google"
                )
            )
        }
    }
}