package com.timeoff.timeoff

enum class VacationStatus {
    PENDING,
    APPROVED,
    REJECTED,
    PENDING_DELETION,
    DELETION_REJECTED,
    DELETED;

    companion object {
        /**
         * Validates if a status transition is allowed
         */
        fun canTransitionTo(from: VacationStatus, to: VacationStatus): Boolean {
            return when (from) {
                PENDING -> setOf(APPROVED, REJECTED, DELETED).contains(to)
                APPROVED -> setOf(PENDING_DELETION).contains(to)
                REJECTED -> setOf(DELETED).contains(to) // Only allow final deletion
                PENDING_DELETION -> setOf(DELETED, DELETION_REJECTED).contains(to)
                DELETION_REJECTED -> setOf(PENDING_DELETION).contains(to) // Allow re-requesting deletion
                DELETED -> false // Final state, no transitions allowed
            }
        }
    }

    /**
     * Whether this vacation can be modified (toggled in calendar)
     */
    fun isModifiable(): Boolean {
        return this == PENDING
    }

    /**
     * Whether this vacation can request deletion
     */
    fun isDeletable(): Boolean {
        return setOf(PENDING, APPROVED).contains(this)
    }
}