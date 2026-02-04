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
     * - deputy_director uchun - har bir deputy_director foydalanuvchi uchun alohida priority yaratiladi
     * - header_frp yaratganda - frp bosqichi skip qilinadi (FRP tasdiqlashi kerak emas)
     * - requires_deputy_approval = false bo'lsa, deputy_director bosqichi skip qilinadi
     */
    private function createSequentialWorkflowPriority(int $document_id, int $type, ?string $creator_type = null): void
    {
        $items = $this->getFromConfig($type);
        if ($items->isEmpty()) {
            throw new \Exception('Не найдено приоритета для типа документа: '.$type);
        }

        // Document type ma'lumotlarini olish (requires_deputy_approval uchun)
        $documentType = DocumentType::find($type);

        // deputy_director skip qilinsa, director va buxgalter ordering ni 1 ga kamaytirish kerak
        $skipDeputy = $documentType && ! $documentType->requires_deputy_approval;
        $orderingAdjustment = 0;

        foreach ($items as $item) {
            // header_frp yaratganda frp bosqichini skip qilish
            // (ular uchun FRP tasdiqlashi kerak emas)
            if ($creator_type === 'header_frp' && $item->user_role === 'frp') {
                continue;
            }

            // deputy_director uchun - requires_deputy_approval tekshiruvi
            if ($item->user_role === 'deputy_director') {
                // Agar requires_deputy_approval = false bo'lsa, deputy_director ni skip qilish
                if ($skipDeputy) {
                    $orderingAdjustment = 1; // Keyingi bosqichlar ordering ni 1 ga kamaytirish

                    continue;
                }

                // Har bir deputy_director foydalanuvchi uchun alohida priority
                $deputyDirectors = User::where('type', 'deputy_director')->get();
                foreach ($deputyDirectors as $deputy) {
                    $this->addPriority([
                        'document_id' => $document_id,
                        'ordering' => $item->ordering,
                        'user_id' => $deputy->id,
                        'user_role' => 'deputy_director',
                        'is_success' => false,
                        'is_active' => true,
                    ]);
                }
            } else {
                // Boshqa rollar uchun oddiy priority
                $data['document_id'] = $document_id;
                $data['ordering'] = $item->ordering - $orderingAdjustment;
                $data['user_role'] = $item->user_role;
                $data['is_success'] = false;
                $data['is_active'] = true;
                $this->addPriority($data);
            }
        }
    }

    /**
     * To'g'ridan-to'g'ri workflow uchun priority yaratish
     * Yaratuvchi (frp/header_frp) → Tayinlangan xodim → Buxgalter
     */
    private function createDirectWorkflowPriority(int $document_id, ?string $creator_type = null): void
    {
        $document = Documents::find($document_id);
        if (! $document) {
            throw new \Exception('Документ не найден: '.$document_id);
        }

        // Yaratuvchi rolini aniqlash (frp yoki header_frp)
        $creatorRole = $creator_type ?? 'frp';

        // 1-bosqich: Yaratuvchi (frp yoki header_frp)
        $this->addPriority([
            'document_id' => $document_id,
            'ordering' => 1,
            'user_id' => $document->user_id,
            'user_role' => $creatorRole,
            'is_success' => false,
            'is_active' => true,
        ]);

        // 2-bosqich: Tayinlangan xodim
        if ($document->assigned_user_id) {
            $this->addPriority([
                'document_id' => $document_id,
                'ordering' => 2,
                'user_id' => $document->assigned_user_id,
                'user_role' => 'assigned',  // Maxsus rol - tayinlangan xodim
                'is_success' => false,
                'is_active' => true,
            ]);
        }

        // 3-bosqich: Buxgalter
        $this->addPriority([
            'document_id' => $document_id,
            'ordering' => $document->assigned_user_id ? 3 : 2,
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
