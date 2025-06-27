package com.timeoff.timeoff

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Enumerated
import jakarta.persistence.EnumType
import java.time.LocalDate

@Entity
data class Vacation(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val employeeId: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    @Enumerated(EnumType.STRING)
    val status: VacationStatus = VacationStatus.PENDING,
    val assignedTo: String? = null, // ID of the person who the vacation is assigned to
    val deletionReason: String? = null // Reason provided when requesting deletion
)
