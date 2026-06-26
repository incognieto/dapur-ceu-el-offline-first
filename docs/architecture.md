# Arsitektur

Proyek ini memakai modular monolith berlapis:

```text
frontend React PWA + IndexedDB
        |
REST API FastAPI
        |
Application services: orders, stock, notifications
        |
Repositories per modul
        |
PostgreSQL
```

Pattern yang sudah menjadi kode:

- Repository Pattern: `app/patterns/repository.py` dan repository per modul.
- Observer Pattern: `EventBus` menerbitkan event pesanan/stok, `NotificationService` menjadi subscriber.
- Strategy Pattern: `StrategyFactory` memilih algoritma kebutuhan bahan per kategori produk.
- State transition: `orders/state.py` menjaga transisi status sesuai dokumen acuan.

Keputusan offline-first:

- Data utama disalin ke IndexedDB (`products`, `ingredients`, `orders`).
- Aksi mutasi saat offline masuk ke `outbox`.
- Saat event `online`, outbox disinkronkan otomatis ke API.
- Service worker menyimpan app shell agar layar tetap terbuka setelah pernah diakses.

