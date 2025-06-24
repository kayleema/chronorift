package com.timeoff.timeoff

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import java.time.LocalDate

@Entity
data class Vacation(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val employeeId: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val status: String // e.g., PENDING, APPROVED, REJECTED
)
