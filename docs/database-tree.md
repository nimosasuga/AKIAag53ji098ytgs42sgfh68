# Database Migration Tree

```
database/
├── .gitignore
├── database.sqlite
├── factories/
│   └── *.php
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   ├── 0001_01_01_000002_create_jobs_table.php
│   ├── 2026_06_20_160030_create_personal_access_tokens_table.php
│   ├── 2026_06_20_161132_create_app_data_table.php
│   ├── 2026_06_20_161136_create_activity_log_table.php
│   ├── 2026_06_20_163503_add_akta_fields_to_users_table.php
│   ├── 2026_06_20_191439_create_plan_audits_table.php
│   ├── 2026_06_20_204352_create_audit_tasks_table.php
│   ├── 2026_06_21_000001_create_picas_table.php
│   ├── 2026_06_21_080713_create_audit_recommendations_table.php
│   ├── 2026_06_21_090000_create_surat_keputusan_table.php
│   ├── 2026_06_21_100000_create_pemeriksaan_kas_table.php
│   └── 2026_06_21_110000_create_pemeriksaan_bank_table.php
└── seeders/
    ├── DatabaseSeeder.php
    └── AktaUserSeeder.php
```

## Migration Summary

### Core Tables
- **users**: User authentication and accounts
- **cache**: Laravel cache system
- **jobs**: Queue jobs
- **personal_access_tokens**: API authentication tokens

### Application Data
- **app_data**: General application configuration data
- **activity_log**: User activity tracking

### Audit System
- **plan_audits**: Main audit plans
- **audit_tasks**: Audit tasks within plans
- **picas**: Problem Identification, Corrective Action
- **audit_recommendations**: Audit recommendations
- **surat_keputusan**: Audit decision letters (SK)
- **pemeriksaan_kas**: Cash inspections
- **pemeriksaan_bank**: Bank inspections

### Seeders
- **DatabaseSeeder**: Base database seeding
- **AktaUserSeeder**: Initial user accounts (admin, auditor, viewer)

## Migration Categories

### Laravel Core (0001_*) 
- Standard Laravel base migrations

### Application Core (2026\*) 
- **Users & Authentication**: User management
- **Audit Framework**: Plan, task, recommendation, pica, SK, kas, bank
- **Activity Tracking**: User actions and logs
- **Configuration**: App data and settings

### Business Logic
- **Audit Process**: Complete audit workflow (plans → tasks → recommendations → picas → SKs → kas → bank)
- **Decision Making**: Approval workflows for manajer and AFD
- **Compliance**: Role-based access control

## Key Relationships
```
PlanAudit
├── AuditTask
├── AuditRecommendation
├── Pica
│   ├── Recommendation (via foreign key)
│   └── Task (via foreign key)
├── SuratKeputusan
├── PemeriksaanKas
└── PemeriksaanBank
```

## Migration Order
1. **Base Laravel** (0001_*) - Core Laravel tables
2. **Application Core** (2026\*) - Business logic tables
3. **Seeders** - Initial data

All migrations follow Laravel's naming convention: `YYYY_MM_DD_HHMMSS_create_table_name.php`