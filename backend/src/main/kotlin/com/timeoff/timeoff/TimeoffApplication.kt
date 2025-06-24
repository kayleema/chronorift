package com.timeoff.timeoff

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TimeoffApplication

fun main(args: Array<String>) {
	runApplication<TimeoffApplication>(*args)
}
