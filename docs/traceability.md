# Traceability Implementasi Awal

| Kebutuhan | Implementasi Fondasi |
|---|---|
| FR-01 | `GET /api/products`, `ProductCatalog`, tabel `products` |
| FR-02, FR-03 | `POST /api/orders`, `OrderForm`, IndexedDB outbox saat offline |
| FR-04, FR-05 | `GET /api/orders`, `PATCH /api/orders/{id}/status`, `OrdersPanel`, state transition |
| FR-06 | Observer event `order.status_changed` membuat record `notifications` |
| FR-07 | Daftar pesanan tersimpan di PostgreSQL dan cache IndexedDB |
| FR-08 | `StockService.estimate_availability()` dan validasi final saat status `diproses` |
| FR-09 | `GET /api/orders/{id}/production-needs` menghitung kebutuhan bahan berbasis BOM |
| FR-10, FR-11 | `GET /api/ingredients`, `POST /api/stock/adjustments`, `StockPanel` |
| FR-12 | `StockService.consume_for_order()` mengurangi stok otomatis saat status `diproses` |
| FR-13 | Observer event `stock.critical` membuat notifikasi admin |
| FR-14 | `GET /api/stock/movements`, tabel `stock_movements` |
| FR-15 | Tabel `recipes`; endpoint CRUD penuh bisa ditambahkan di modul `stock` tanpa mengubah struktur |
| FR-16 | `GET /api/stock/critical`, indikator meter di `StockPanel` |
| FR-17 | Dependency `require_role()` berbasis header `X-Role` sebagai fondasi RBAC |
| FR-18 | React PWA responsif, service worker, IndexedDB; siap dibungkus WebView/TWA untuk Android |
| NFR-01 | Endpoint tipis, query terindeks, operasi stok dalam transaksi DB |
| NFR-02 | Compose healthcheck PostgreSQL dan endpoint `/health` backend |
| NFR-03 | UI satu layar untuk katalog, buat pesanan, stok, dashboard |
| NFR-04 | RBAC fondasi; TLS disiapkan di reverse proxy/hosting produksi |
| NFR-05 | IndexedDB outbox dan service worker cache |
| NFR-06 | Produk/bahan/resep berada di database, bukan hardcoded di frontend |
| NFR-07 | PWA responsif untuk Android 8+ modern browser |
| NFR-08 | State transition backend mencegah aksi status tidak valid; konfirmasi destruktif bisa ditambahkan di UI |
| NFR-09 | Notifikasi disimpan real-time di database; FCM dapat menjadi subscriber Observer berikutnya |

