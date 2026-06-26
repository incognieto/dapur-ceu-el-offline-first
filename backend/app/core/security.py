from fastapi import Header, HTTPException, status


ROLE_ORDER = {"pelanggan": 1, "staf_produksi": 2, "admin": 3}


def require_role(required_role: str):
    def dependency(x_role: str = Header(default="admin")) -> str:
        if ROLE_ORDER.get(x_role, 0) < ROLE_ORDER[required_role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses butuh peran minimal {required_role}. Kirim header X-Role.",
            )
        return x_role

    return dependency

