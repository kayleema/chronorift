package com.timeoff.timeoff

import java.time.LocalDate

data class VacationRequest(
    val startDate: LocalDate,
    val endDate: LocalDate,
    val assignedTo: String? = null
)
