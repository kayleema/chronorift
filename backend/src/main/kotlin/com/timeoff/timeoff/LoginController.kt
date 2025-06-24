package com.timeoff.timeoff

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class LoginController {
    
    @GetMapping("/login")
    fun login(): String {
        return "redirect:/oauth2/authorization/google"
    }
}