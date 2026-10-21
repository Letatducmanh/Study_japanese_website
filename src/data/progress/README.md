# src/data/progress

`ProgressRepository` (interface) + `dexie-repo.ts` (cài đặt bằng Dexie/IndexedDB). UI và domain chỉ phụ thuộc interface này, không import Dexie trực tiếp ở nơi khác.
