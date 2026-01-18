# Document (АКТ) Workflow System

## Umumiy tushuncha

Tizimda hujjatlar (aktlar) yaratiladi va tasdiqlash jarayonidan o'tadi. Hujjat turi va yaratuvchi roliga qarab ikki xil workflow mavjud.

## Foydalanuvchi rollari

| Rol | Kod | Hujjat yarata oladi | Tavsif |
|-----|-----|---------------------|--------|
| МОЛ (Materially Responsible Person) | `frp` | ✅ Ha | Oddiy ishchi |
| Старший МОЛ | `header_frp` | ✅ Ha | Ishchilar boshligi |
| Бухгалтер | `buxgalter` | ✅ Ha | Moliyaviy mas'ul |
| Заместитель директора | `deputy_director` | ✅ Ha | Direktor o'rinbosari |
| Директор | `director` | ❌ Yo'q | Faqat yakuniy tasdiqlash |
| Назначенный сотрудник | `assigned` | - | Tayinlangan ishchi (ikkinchi tomon) |

**Hujjat yaratuvchilar:** FRP, Header FRP, Buxgalter, Deputy Director

## Workflow turlari

### 1. Standart Workflow (rol bo'yicha ketma-ketlik)

Hujjat avtomatik ravishda rollarga ketma-ket yuboriladi. **Ikkinchi tomon tanlanmaydi** - hujjat workflow bo'yicha keyingi rolga o'tib ketaveradi.

#### Deputy Director tasdiqlashi (requires_deputy_approval)

`document_type` jadvalida `requires_deputy_approval` maydoni mavjud:
- `true` - Deputy Director tasdiqlashi **kerak**
- `false` - Deputy Director bosqichi **o'tkazib yuboriladi**

**Yaratuvchiga qarab ketma-ketlik:**

| Yaratuvchi | requires_deputy = TRUE | requires_deputy = FALSE |
|------------|------------------------|-------------------------|
| FRP | FRP → Header FRP → Buxgalter → Deputy Director → Director | FRP → Header FRP → Buxgalter → Director |
| Header FRP | Header FRP → Buxgalter → Deputy Director → Director | Header FRP → Buxgalter → Director |
| Buxgalter | Buxgalter → Deputy Director → Director | Buxgalter → Director |
| Deputy Director | Deputy Director → Director | Deputy Director → Director |

```
Yaratuvchi → [Keyingi rollar ketma-ket] → Director → TUGADI
```

**Jarayon:**
1. **Yaratuvchi** (FRP/Header FRP/Buxgalter/Deputy Director) hujjat yaratadi va **jo'natadi**
2. Keyingi rollar ketma-ket tasdiqlaydi
3. Agar `requires_deputy_approval = true` bo'lsa, **Deputy Director** tasdiqlaydi
4. **Director** yakuniy tasdiqlaydi → hujjat tugaydi

**Xususiyatlari:**
- Ikkinchi tomon tanlanmaydi - avtomatik ketma-ketlik
- Har bir rol o'z navbatida tasdiqlaydi
- Yaratuvchi o'zidan keyingi rollarga yuboradi
- `document_priority` jadvalidagi `user_role` maydonida rol nomi saqlanadi
- `ordering` maydoni navbatni belgilaydi
- Har bir bosqichda OTP tasdiqlash talab qilinadi
- **Ko'p deputy_director** - agar bir nechta deputy_director foydalanuvchi bo'lsa, har biri alohida tasdiqlashi kerak

**Misol (FRP yaratganda, requires_deputy = TRUE):**
```
FRP (yaratdi) → Header FRP → Buxgalter → Deputy Director → Director → YAKUNLANDI
```

**Misol (FRP yaratganda, requires_deputy = FALSE):**
```
FRP (yaratdi) → Header FRP → Buxgalter → Director → YAKUNLANDI
```

### 2. To'g'ridan-to'g'ri Workflow (assigned - ikkinchi tomon tanlangan)

Ishchi boshqa ishchiga hujjat yuboradi. `document_type.workflow_type = 2` bo'lganda ishlatiladi.

```
FRP A (yaratuvchi) → Assigned FRP B → Buxgalter → [tugadi]
      status=1          status=2        status=3
```

**Xususiyatlari:**
- Yaratuvchi ikkinchi ishchini (`assigned_user_id`) tanlaydi
- Hujjat yaratuvchining **draft** bo'limida saqlanadi
- Boshqa hech kim ko'rmaydi (hatto tanlangan ishchi ham)
- Yaratuvchi **jo'natgandan** keyin tanlangan ishchida ko'rinadi
- Tanlangan ishchi uchun `document_priority.user_role = 'assigned'`
- Tanlangan ishchi tasdiqlagandan keyin buxgalterga boradi
- Buxgalter tasdiqlasa - workflow tugaydi
- Deputy Director **ishtirok etmaydi**

## Document Type jadvali

```
document_type
├── id
├── code                      - Hujjat kodi (mounted, dismantling, etc.)
├── title                     - Hujjat nomi
├── workflow_type             - Workflow turi (1=sequential, 2=direct)
├── requires_deputy_approval  - Deputy Director tasdiqlashi kerakmi (true/false)
└── timestamps
```

**Hozirgi sozlamalar:**

| ID | Code | Title | workflow_type | requires_deputy |
|----|------|-------|---------------|-----------------|
| 1 | mounted | Смонтированных | 1 (Sequential) | ✅ TRUE |
| 2 | dismantling | Демонтажа | 1 (Sequential) | ❌ FALSE |
| 3 | write_offs | Списания | 1 (Sequential) | ❌ FALSE |
| 4 | MODERNIZATION | приём-передач | 2 (Direct) | ❌ FALSE |

## Document Priority Config jadvali

```
document_priority_config
├── id
├── type_id       - Document type ID
├── ordering      - Navbat (1, 2, 3, 4, 5)
├── user_role     - Rol nomi (frp, header_frp, buxgalter, deputy_director, director)
├── options       - JSON (sms_confirm, attached_head, check_product, check_main)
└── timestamps
```

**Standart config (Sequential workflow):**

| ordering | user_role | Tavsif |
|----------|-----------|--------|
| 1 | frp | МОЛ - hujjat yaratuvchi |
| 2 | header_frp | Старший МОЛ |
| 3 | buxgalter | Бухгалтер |
| 4 | deputy_director | Заместитель директора (agar requires_deputy = true) |
| 5 | director | Директор - yakuniy tasdiq |

## Document Priority jadvali

```
document_priority
├── id
├── document_id      - Hujjat ID
├── ordering         - Navbat (1, 2, 3, 4, 5)
├── user_id          - Maxsus foydalanuvchi ID (assigned/deputy uchun)
├── user_role        - Rol nomi (frp, buxgalter, assigned, deputy_director, etc.)
├── is_success       - Tasdiqlangan (0/1)
├── is_active        - Faol (0/1)
└── timestamps
```

**Eslatma:** `deputy_director` uchun har bir foydalanuvchi alohida priority yozuvi yaratiladi (`user_id` bilan).

## Hujjat holatlari

| Status | Tavsif |
|--------|--------|
| `is_draft = 1` | Chernovik (faqat yaratuvchida) |
| `is_draft = 0` | Jo'natilgan |
| `is_returned = 1` | Qaytarilgan |
| `is_finished = 1` | Yakunlangan |
| `status` | Hozirgi bosqich (1-5) |

## Frontend sahifalar

| URL | Tavsif | Ko'rinadigan foydalanuvchilar |
|-----|--------|------------------------------|
| `/documents/draft` | Chernoviklar | FRP, Header FRP |
| `/documents/sent` | Jo'natilgan/Kelgan (rol bo'yicha) | Barcha rollar |
| `/documents/incoming` | Kelgan (assigned) | Tayinlangan ishchilar |
| `/documents/return` | Qaytarilgan | FRP, Header FRP |

## OTP tasdiqlash

1. Foydalanuvchi "Подтвердить" bosadi
2. Tizim OTP kodini generatsiya qiladi
3. Telegram orqali foydalanuvchiga yuboriladi
4. Foydalanuvchi kodni kiritadi
5. Kod to'g'ri bo'lsa - hujjat keyingi bosqichga o'tadi

## Diagrammalar

### 1. Standart Workflow (requires_deputy_approval = TRUE)

```
    ┌─────────────────┐
    │  FRP yaratadi   │
    │  va JO'NATADI   │ ←── OTP tasdiqlash
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Header FRP     │
    │  (Boshliq)      │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   Buxgalter     │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │ Deputy Director │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │     (har bir deputy)
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │    Director     │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ╔═════════════════╗
    ║    YAKUNLANDI   ║
    ╚═════════════════╝
```

### 2. Standart Workflow (requires_deputy_approval = FALSE)

```
    ┌─────────────────┐
    │  FRP yaratadi   │
    │  va JO'NATADI   │ ←── OTP tasdiqlash
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Header FRP     │
    │  (Boshliq)      │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   Buxgalter     │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │    Director     │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │     (Deputy o'tkazib yuboriladi)
    └────────┬────────┘
             │
             ▼
    ╔═════════════════╗
    ║    YAKUNLANDI   ║
    ╚═════════════════╝
```

### 3. To'g'ridan-to'g'ri Workflow (workflow_type = 2)

```
    ┌─────────────────┐
    │  FRP A yaratadi │
    │  FRP B ni       │
    │  TANLAYDI       │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  DRAFT'da       │  ←── Faqat FRP A ko'radi
    │  saqlanadi      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  FRP A          │ ←── OTP tasdiqlash
    │  JO'NATADI      │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  FRP B (assigned)│ ←── Endi "KELGAN"da
    │  TASDIQLAYDI    │ ←── OTP tasdiqlash
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │   Buxgalter     │ ←── OTP tasdiqlash
    │  TASDIQLAYDI    │
    └────────┬────────┘
             │
             ▼
    ╔═════════════════╗
    ║    YAKUNLANDI   ║
    ╚═════════════════╝
```

## Workflow farqlari

| Xususiyat | Sequential (deputy=true) | Sequential (deputy=false) | Direct |
|-----------|--------------------------|---------------------------|--------|
| workflow_type | 1 | 1 | 2 |
| Ikkinchi tomon | Tanlanmaydi | Tanlanmaydi | Tanlanadi |
| Ketma-ketlik | FRP→Header→Bux→Deputy→Dir | FRP→Header→Bux→Dir | FRP A→FRP B→Bux |
| Deputy Director | ✅ Ha | ❌ Yo'q | ❌ Yo'q |
| Yakuniy tasdiq | Director | Director | Buxgalter |
| Bosqichlar | 5 ta | 4 ta | 3 ta |

## Tegishli fayllar

### Backend
- `app/Services/DocumentService.php` - Asosiy business logic
- `app/Services/DocumentPriorityService.php` - Priority boshqaruvi va workflow logikasi
- `app/Http/Controllers/DocumentController.php` - HTTP controller
- `app/Models/Documents.php` - Hujjat modeli
- `app/Models/DocumentType.php` - Hujjat turi modeli (workflow_type, requires_deputy_approval)
- `app/Models/DocumentPriority.php` - Priority modeli
- `app/Models/DocumentPriorityConfig.php` - Config modeli

### Frontend
- `resources/js/pages/documents.tsx` - Hujjatlar ro'yxati
- `resources/js/pages/documents/show.tsx` - Hujjat ko'rish va tasdiqlash
- `resources/js/pages/documents/create.tsx` - Hujjat yaratish
- `resources/js/pages/documents/edit.tsx` - Hujjat tahrirlash
- `resources/js/pages/document-types.tsx` - Hujjat turlari ro'yxati
- `resources/js/pages/document-types/edit.tsx` - Hujjat turi tahrirlash (requires_deputy sozlash)

### Migrations
- `2023_06_13_170039_create_user_roles.php` - user_roles, document_type, document_priority_config jadvallarini yaratish
- `2026_01_03_123442_add_workflow_type_to_document_type_table.php` - workflow_type maydoni
- `2026_01_03_150655_add_requires_deputy_approval_to_document_type_table.php` - requires_deputy_approval maydoni
- `2026_01_18_111349_add_deputy_director_to_priority_config.php` - deputy_director ni config ga qo'shish
