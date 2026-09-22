<?php

namespace App\Services;

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
use App\Models\Documents;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Class DocumentPriorityService
 */
class DocumentPriorityService
{
    public function getFromConfig(int $type): ?Collection
    {
        return DocumentPriorityConfig::where('type_id', $type)->orderBy('ordering')->get();
    }

    public function checkConfigByOrderingRole($ordering, $role, $type): ?DocumentPriorityConfig
    {
        return DocumentPriorityConfig::query()->where([
            ['ordering', $ordering],
            ['user_role', $role],
            ['type_id', $type],
        ])->first();
    }

    private function addPriority(array $data)
    {
        DocumentPriority::create($data);
    }

    public function createPriority($document_id, $type, ?string $creator_type = null): void
    {
        // Проверяем что type не null
        if (is_null($type)) {
            throw new \Exception('Тип документа не указан для создания приоритета');
        }

        // DocumentType dan workflow_type ni olish
        $documentType = DocumentType::find($type);
        if (! $documentType) {
            throw new \Exception('Тип документа не найден: '.$type);
        }

        // Workflow turiga qarab priority yaratish
        if ($documentType->isDirectWorkflow()) {
            $this->createDirectWorkflowPriority($document_id, $creator_type);
        } else {
            $this->createSequentialWorkflowPriority($document_id, $type, $creator_type);
        }
    }

    /**
     * Ketma-ket workflow uchun priority yaratish
     * Tartib: FRP(1) → Header FRP(2) → Deputy Director(3) → Director(4) → Buxgalter(5)
     * - Zanjir yaratuvchining o'z bosqichidan boshlanadi: undan quyidagi bosqichlar tushib qoladi
     *   (frp → to'liq zanjir; header_frp → frp'siz; deputy_director → frp va header_frp'siz). Issue #29, #30.
     * - deputy_director — rol asosidagi bitta bosqich (istalgan bitta zam direktor tasdiqlaydi)
     * - hujjatning requires_deputy_approval = false bo'lsa, deputy_director bosqichi skip qilinadi.
     *   Yaratuvchi o'zi deputy_director bo'lsa, uning bosqichi belgidan qat'i nazar saqlanadi.
     */
    private function createSequentialWorkflowPriority(int $document_id, int $type, ?string $creator_type = null): void
    {
        $items = $this->getFromConfig($type);
        if ($items->isEmpty()) {
            throw new \Exception('Не найдено приоритета для типа документа: '.$type);
        }

        $document = Documents::find($document_id);

        $creatorOrdering = $this->creatorOrdering($items, $creator_type);
        $skipDeputy = $creator_type !== 'deputy_director' && (! $document || ! $document->requires_deputy_approval);
        $orderingAdjustment = 0;

        foreach ($items as $item) {
            // Yaratuvchidan quyidagi bosqichlar tushib qoladi — yaratuvchi o'zi shu bosqichda turibdi
            if ($item->ordering < $creatorOrdering) {
                continue;
            }

            if ($item->user_role === 'deputy_director' && $skipDeputy) {
                $orderingAdjustment = 1;

                continue;
            }

            $this->addPriority([
                'document_id' => $document_id,
                'ordering' => $item->ordering - $orderingAdjustment,
                'user_role' => $item->user_role,
                'is_success' => false,
                'is_active' => true,
            ]);
        }
    }

    /**
     * Yaratuvchi rolining config'dagi bosqichi. Rol zanjirda bo'lmasa — 1 (hech narsa tushmaydi).
     *
     * @param  Collection<int, DocumentPriorityConfig>  $items
     */
    private function creatorOrdering(Collection $items, ?string $creator_type): int
    {
        $stage = $creator_type ? $items->firstWhere('user_role', $creator_type) : null;

        return $stage ? (int) $stage->ordering : 1;
    }

    /**
     * Hujjat zanjirining birinchi (yaratuvchi) bosqichi — hujjat status'i shu yerdan boshlanadi.
     */
    public function firstOrdering(int $document_id): int
    {
        return (int) (DocumentPriority::query()
            ->where('document_id', $document_id)
            ->where('is_active', true)
            ->min('ordering') ?? 1);
    }

    /**
     * To'g'ridan-to'g'ri workflow (Приём-передача) uchun priority yaratish
     * Yaratuvchi (frp) → Boshliq (senior_id) → Tayinlangan xodim → Buxgalter
     * - Boshliq bosqichi faqat yaratuvchi frp bo'lganda va senior_id mavjud bo'lganda qo'shiladi.
     * - header_frp o'zi boshliq bo'lgani uchun boshliq bosqichi tashlab ketiladi.
     * - Boshliq tasdiqlamaguncha hujjat status'i tayinlangan xodim bosqichiga yetmaydi,
     *   shuning uchun qabul qiluvchi aktni boshliq tasdig'idan oldin ko'rmaydi.
     */
    private function createDirectWorkflowPriority(int $document_id, ?string $creator_type = null): void
    {
        $document = Documents::find($document_id);
        if (! $document) {
            throw new \Exception('Документ не найден: '.$document_id);
        }

        // Yaratuvchi rolini aniqlash (frp yoki header_frp)
        $creatorRole = $creator_type ?? 'frp';
        $ordering = 1;

        // 1-bosqich: Yaratuvchi (frp yoki header_frp)
        $this->addPriority([
            'document_id' => $document_id,
            'ordering' => $ordering++,
            'user_id' => $document->user_id,
            'user_role' => $creatorRole,
            'is_success' => false,
            'is_active' => true,
        ]);

        // 2-bosqich: Yaratuvchining boshlig'i (senior_id)
        // header_frp o'zi boshliq bo'lgani uchun bu bosqich tashlab ketiladi.
        $creator = User::find($document->user_id);
        if ($creatorRole !== 'header_frp' && $creator && $creator->senior_id) {
            $this->addPriority([
                'document_id' => $document_id,
                'ordering' => $ordering++,
                'user_id' => $creator->senior_id,
                'user_role' => 'header_frp',
                'is_success' => false,
                'is_active' => true,
            ]);
        }

        // Keyingi bosqich: Tayinlangan xodim (qabul qiluvchi)
        if ($document->assigned_user_id) {
            $this->addPriority([
                'document_id' => $document_id,
                'ordering' => $ordering++,
                'user_id' => $document->assigned_user_id,
                'user_role' => 'assigned',  // Maxsus rol - tayinlangan xodim
                'is_success' => false,
                'is_active' => true,
            ]);
        }

        // Oxirgi bosqich: Buxgalter (jarayonni yakunlaydi, tasdiq/rad qila oladi)
        $this->addPriority([
            'document_id' => $document_id,
            'ordering' => $ordering,
            'user_role' => 'buxgalter',
            'is_success' => false,
            'is_active' => true,
        ]);
    }

    public function removePriority($document_id): void
    {
        DocumentPriority::where('document_id', $document_id)->delete();
    }

    public function getPriorityByOrdering($document_id, $ordering): ?DocumentPriority
    {
        return DocumentPriority::query()->where([
            'document_id' => $document_id,
            'ordering' => $ordering,
            'is_active' => true,
        ])->first();
    }

    public function configByType($type)
    {
        return DocumentPriorityConfig::where('type_id', $type)
            ->orderBy('ordering', 'ASC')
            ->get();
    }

    public function savePriority($request): void
    {
        DB::beginTransaction();
        try {
            $type = $request->input('type');
            $this->deleteConfigPriority($type);
            $this->addConfigPriority($request->all());
            DB::commit();
        } catch (QueryException $e) {
            DB::rollBack();
            throw new \Exception($e->getMessage());
        }
    }

    private function deleteConfigPriority($type): void
    {
        DocumentPriorityConfig::where('type_id', $type)->delete();
    }

    private function addConfigPriority(array $data): void
    {
        foreach ($data['config'] as $config) {
            $priority = new DocumentPriorityConfig;
            $priority->type_id = $data['type'];
            $priority->ordering = $config['ordering'];
            $priority->user_role = $config['user_role'];
            $priority->options = $config['options'] ? json_encode($config['options']) : null;
            $priority->save();
        }
    }

    public function lastDocumentPriority($document_id, $ordering): bool
    {
        $response = false;
        $last = DocumentPriority::where([
            'document_id' => $document_id,
            'is_active' => 1,
        ])->orderBy('ordering', 'DESC')
            ->first();
        if ($last->ordering == $ordering) {
            $response = true;
        }

        return $response;
    }

    /**
     * Barcha deputy_director lar tasdiqlagan yoki yo'qligini tekshirish
     */
    public function allDeputyDirectorsApproved(int $document_id, int $ordering): bool
    {
        $pendingDeputies = DocumentPriority::where([
            'document_id' => $document_id,
            'ordering' => $ordering,
            'user_role' => 'deputy_director',
            'is_active' => true,
            'is_success' => false,
        ])->count();

        return $pendingDeputies === 0;
    }

    /**
     * Ma'lum foydalanuvchi uchun priority olish
     */
    public function getPriorityByOrderingAndUser(int $document_id, int $ordering, int $user_id): ?DocumentPriority
    {
        return DocumentPriority::query()->where([
            'document_id' => $document_id,
            'ordering' => $ordering,
            'user_id' => $user_id,
            'is_active' => true,
        ])->first();
    }

    public function updateDocumentPriority($id, $data)
    {
        DocumentPriority::where('id', $id)->update($data);
    }
}
