from fastapi import HTTPException, status


TRANSITIONS: dict[str, set[str]] = {
    "menunggu_konfirmasi": {"dikonfirmasi", "dibatalkan"},
    "dikonfirmasi": {"diproses", "dibatalkan"},
    "diproses": {"siap_diambil"},
    "siap_diambil": {"selesai"},
    "selesai": set(),
    "dibatalkan": set(),
}


def assert_transition_allowed(current_status: str, next_status: str) -> None:
    if next_status not in TRANSITIONS.get(current_status, set()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transisi status {current_status} -> {next_status} tidak diperbolehkan.",
        )

