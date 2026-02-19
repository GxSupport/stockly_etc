# API Javoblari (1C IstTelecom)

**Sana**: 18.02.2026
**Base URL**: `http://89.236.216.12:8083`
**Auth**: Basic (httpbot:httpbot)

---

## 1. Tovarlar ro'yxati (Sklad bo'yicha nomenklatura)

**Endpoint**: `GET /base2/hs/CarData/os/empl`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `m` | Hardcoded `get_stock_leftover` | Statik qiymat |
| `code` | `warehouse.code` | User omborining kodi (`user_warehouse` -> `warehouse.code`) |
| `wh_name` | `warehouse.title` | User omborining nomi (`user_warehouse` -> `warehouse.title`) |
| `date` | `$request->date` yoki `date('d.m.Y')` | Sana (format: `dd.mm.yyyy`), default bugun |

**Qanday olinadi**:
```php
$warehouse = UserWarehouse::where('user_id', $user->id)->with('warehouse')->first();
$code  = $warehouse->warehouse->code;   // "000000001"
$title = $warehouse->warehouse->title;  // "Основной склад"
```

### 1C dan qaytgan JSON

Bitta element namunasi:
```json
{
  "Номенклатура": "HUB TPLink 8 порт",
  "КодНоменклатуры": "109000262",
  "Склад": "ОСНОВНОЙ СКЛАД",
  "КодСклада": "000000001",
  "ЕдИзм": "шт.",
  "СуммаОстаток": "572 000",
  "КоличествоОстаток": "22"
}
```

To'liq javob (47 ta element, qisqartirilgan):
```json
[
  {
    "Номенклатура": "HUB TPLink 8 порт",
    "КодНоменклатуры": "109000262",
    "Склад": "ОСНОВНОЙ СКЛАД",
    "КодСклада": "000000001",
    "ЕдИзм": "шт.",
    "СуммаОстаток": "572 000",
    "КоличествоОстаток": "22"
  },
  {
    "Номенклатура": "Патч корд (SM-DX-SC/LC-UPC, 2 mm, 3 m)",
    "КодНоменклатуры": "109000302",
    "Склад": "ОСНОВНОЙ СКЛАД",
    "КодСклада": "000000001",
    "ЕдИзм": "шт.",
    "СуммаОстаток": "100 978,64",
    "КоличествоОстаток": "4"
  },
  {
    "Номенклатура": "4 G Pocket WiFi",
    "КодНоменклатуры": "901006399",
    "Склад": "ОСНОВНОЙ СКЛАД",
    "КодСклада": "000000001",
    "ЕдИзм": "шт.",
    "СуммаОстаток": "900 000",
    "КоличествоОстаток": "2"
  }
]
```

### Laravel DTO ga mapping

```
"Номенклатура"        -> ProductData.name
"Склад"               -> ProductData.warehouse
"ЕдИзм"              -> ProductData.measure
"СуммаОстаток"        -> ProductData.price        (float, numberFromStringForProduct() orqali)
"КоличествоОстаток"   -> ProductData.count
"КодНоменклатуры"     -> ProductData.nomenclature
```

---

## 2. Aktiv tarkibi (Asosiy vositalar - OC)

**Endpoint**: `POST /base2/hs/CarData/os_composition/get_composition`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `dateStart` | `Carbon::now()->subYear()->format('d.m.Y')` | 1 yil oldingi sana (Guzzle) yoki `Carbon::now()->subMonth()` (Saloon) |
| `dateEnd` | `Carbon::now()->format('d.m.Y')` | Bugungi sana |
| `os[].osCode` | Frontend `$request->os_code` | Asosiy vosita kodi (masalan: `ETC003313`) |

**Request body**:
```json
{
  "dateStart": "18.02.2025",
  "dateEnd": "18.02.2026",
  "os": [
    {
      "osCode": "ETC003313"
    }
  ]
}
```

### 1C dan qaytgan JSON

Agar ma'lumot topilsa (koddan olingan struktura):
```json
[
  {
    "СчетДт": "26",
    "СчетКт": "02.01",
    "СубконтоДт1": "Отдел Электронной коммерции",
    "СубконтоКт1": "Почтамат/Metal Locker/1",
    "СубконтоКт3": "Начисление амортизации",
    "СуммаОборот": "1 234 567,89",
    "КоличествоОборотКт": "1"
  }
]
```

> **Eslatma**: `ETC003313` kodi uchun test natijasi bo'sh massiv `[]` qaytdi.

### Laravel DTO ga mapping

```
"СчетДт"              -> CompositionData.account_dt
"СчетКт"              -> CompositionData.account_kt
"СубконтоДт1"         -> CompositionData.subconto_dt1
"СубконтоКт1"         -> CompositionData.subconto_kt1
"СубконтоКт3"         -> CompositionData.subconto_kt3
"СуммаОборот"          -> CompositionData.sum_turnover        (float, numberFromStringForProduct() orqali)
"КоличествоОборотКт"  -> CompositionData.quantity_turnover_kt (float, numberFromStringForProduct() orqali)
```

---

## 3. Asosiy vositalar ro'yxati (OC qoldig'i)

**Endpoint**: `GET /base2/hs/CarData/goods/goodsget_stock_leftover_os`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `date` | `$info['date']` yoki `date('d.m.Y')` | Sana (format: `dd.mm.yyyy`) |
| `fooCode` | `$info['foo_code']` | Ixtiyoriy - MAS kodi |
| `whCode` | `warehouse.code` | Ombor kodi (`user_warehouse` -> `warehouse.code`) |
| `depCode` | `user.dep_code` | Bo'lim kodi (User modelidan) |

**Qanday olinadi**:
```php
$user = Auth::user();
$wh = UserWarehouse::where('user_id', $user->id)->with('warehouse')->first();

$info['dep_code']       = $user->dep_code;         // "000000005"
$info['warehouse_code'] = $wh->warehouse->code;    // "000000001"
```

### 1C dan qaytgan JSON

Bitta element namunasi:
```json
{
  "ОсновноеСредство": "Почтамат/Metal Locker/1",
  "СтоимостьОстаток": "23 220 969,05",
  "КоличествоОстаток": "1",
  "АмортизацияОстаток": "13 545 565,25",
  "ПереоценкаОстаток": "0",
  "ПодразделениеОрганизации": "Отдел Электронной коммерции",
  "Склад": "Склад Гадельшина",
  "МОЛ": "Гадельшин А.Н.",
  "СчетУчетаБУ": "01.90",
  "СчетНачисленияАмортизацииБУ": "02.01",
  "ОсновноеСредствоКод": "ETC003313",
  "СкладКод": "000000003",
  "МОЛКод": "Т-00020",
  "ПодразделениеОрганизацииКод": "000000005"
}
```

To'liq javob (13 ta element, qisqartirilgan):
```json
[
  {
    "ОсновноеСредство": "Почтамат/Metal Locker/1",
    "СтоимостьОстаток": "23 220 969,05",
    "КоличествоОстаток": "1",
    "АмортизацияОстаток": "13 545 565,25",
    "ПереоценкаОстаток": "0",
    "ПодразделениеОрганизации": "Отдел Электронной коммерции",
    "Склад": "Склад Гадельшина",
    "МОЛ": "Гадельшин А.Н.",
    "СчетУчетаБУ": "01.90",
    "СчетНачисленияАмортизацииБУ": "02.01",
    "ОсновноеСредствоКод": "ETC003313",
    "СкладКод": "000000003",
    "МОЛКод": "Т-00020",
    "ПодразделениеОрганизацииКод": "000000005"
  },
  {
    "ОсновноеСредство": "Почтамат/Metal Locker/2",
    "СтоимостьОстаток": "23 220 969,05",
    "КоличествоОстаток": "1",
    "АмортизацияОстаток": "13 545 565,25",
    "ПереоценкаОстаток": "0",
    "ПодразделениеОрганизации": "Отдел Электронной коммерции",
    "Склад": "Склад Гадельшина",
    "МОЛ": "Гадельшин А.Н.",
    "СчетУчетаБУ": "01.90",
    "СчетНачисленияАмортизацииБУ": "02.01",
    "ОсновноеСредствоКод": "ETC003314",
    "СкладКод": "000000003",
    "МОЛКод": "Т-00020",
    "ПодразделениеОрганизацииКод": "000000005"
  }
]
```

### Laravel DTO ga mapping

```
"ОсновноеСредство"             -> ProductServiceData.name
"СтоимостьОстаток"             -> ProductServiceData.cost_balance        (float)
"КоличествоОстаток"            -> ProductServiceData.quantity_balance
"АмортизацияОстаток"           -> ProductServiceData.deprecation_balance (float)
"ПереоценкаОстаток"            -> ProductServiceData.revaluation_balance
"ПодразделениеОрганизации"      -> ProductServiceData.organization
"СчетУчетаБУ"                  -> ProductServiceData.account
"СчетНачисленияАмортизацииБУ"  -> ProductServiceData.deprecation_account
"ОсновноеСредствоКод"          -> ProductServiceData.basic_resource_code
"СкладКод"                     -> ProductServiceData.warehouse_code
"МОЛКод"                       -> ProductServiceData.frp_code
"ПодразделениеОрганизацииКод"  -> ProductServiceData.organization_code
```

---

## 4. Tovar mavjudligini tekshirish

**Endpoint**: `POST /base2/hs/CarData/check_goods/check_leftovers_in_stock`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `date` | Hujjat sanasi | Format: `dd.mm.yyyy` |
| `whCode` | `warehouse.code` | Ombor kodi |
| `goods` | Hujjat mahsulotlari | Tovarlar massivi |

**Request body**:
```json
{
  "date": "18.02.2026",
  "whCode": "000000001",
  "goods": [
    {
      "nomenclatureCode": "109000262",
      "quantity": 5
    }
  ]
}
```

---

## 5. OC mavjudligini tekshirish

**Endpoint**: `POST /base2/hs/CarData/check_os/check_os_in_stock`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `date` | Hujjat sanasi | Format: `dd.mm.yyyy` |
| `depCode` | `user.dep_code` | Bo'lim kodi |
| `whCode` | `warehouse.code` | Ombor kodi |
| `fooCode` | Ixtiyoriy | MAS kodi |
| `osCodes` | Tanlangan asosiy vositalar | OC kodlari massivi |

**Request body**:
```json
{
  "date": "18.02.2026",
  "depCode": "000000005",
  "whCode": "000000001",
  "fooCode": "",
  "osCodes": [
    { "osCode": "ETC003313" },
    { "osCode": "ETC003314" }
  ]
}
```

---

## 6. Demontaj aktini yuborish (1C ga yozish)

**Endpoint**: `POST /base2/hs/CarData/goods/basedismantling_act_goods`

### Bazadan yuborilgan parametrlar

| Param | Manba | Izoh |
|-------|-------|------|
| `docDate` | `documents.date_order` | Hujjat sanasi (format: `yyyy.mm.dd HH:ii:ss`) |
| `docNumber` | `documents.number` | Hujjat raqami (masalan: `2026/15`) |
| `whCode` | `warehouse.code` | Ombor kodi |
| `whName` | `warehouse.title` | Ombor nomi |
| `docDataProducts` | `document_products` | Mahsulotlar massivi |

**Request body**:
```json
[
  {
    "docDate": "2026.02.18 00:00:00",
    "docNumber": "2026/15",
    "whCode": "000000001",
    "whName": "Основной склад",
    "docDataProducts": [
      {
        "nomenclatureCode": "109000262",
        "nomenclatureName": "HUB TPLink 8 порт",
        "quantity": 2,
        "amount": 572000
      }
    ]
  }
]
```

---

## Bazadagi tegishli jadvallar

### `warehouse` jadvali
| Ustun | Tip | Ishlatilish |
|-------|-----|-------------|
| `code` | string | 1C ga `whCode`, `code` sifatida yuboriladi |
| `title` | string | 1C ga `wh_name`, `whName` sifatida yuboriladi |
| `type` | int | Ombor turi (faqat ichki) |
| `price_type` | string | Narx turi (faqat ichki) |

### `user_warehouse` jadvali
| Ustun | Tip | Ishlatilish |
|-------|-----|-------------|
| `user_id` | int | Foydalanuvchiga bog'lash |
| `warehouse_id` | int | `warehouse.id` ga bog'lash |

### `users` jadvali (1C bilan bog'liq ustunlar)
| Ustun | Tip | Ishlatilish |
|-------|-----|-------------|
| `dep_code` | string | 1C ga `depCode` sifatida yuboriladi |
| `type` | string | Rol (frp, header_frp, director, etc.) |

### `documents` jadvali
| Ustun | Tip | Ishlatilish |
|-------|-----|-------------|
| `number` | string | 1C ga `docNumber` sifatida yuboriladi |
| `date_order` | date | 1C ga `docDate` sifatida yuboriladi |
| `type` | int | Hujjat turi |

### `document_products` jadvali
| Ustun | Tip | Ishlatilish |
|-------|-----|-------------|
| `title` | string | Mahsulot nomi (1C dan `Номенклатура`) |
| `nomenclature` | string | 1C kod (`КодНоменклатуры`) |
| `measure` | string | O'lchov birligi (`ЕдИзм`) |
| `amount` | float | Narxi (`СуммаОстаток`) |
| `quantity` | int | Soni |
