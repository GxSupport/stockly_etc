<?php

namespace App\Services;

use App\Models\DocumentPriority;
use App\Models\DocumentPriorityConfig;
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
        return DocumentPriorityConfig::where('type_id', $type)->get();
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

    public function createPriority($document_id, $type): void
    {
        // Проверяем что type не null
        if (is_null($type)) {
            throw new \Exception('Тип документа не указан для создания приоритета');
        }

        $items = $this->getFromConfig($type);
        if ($items->isEmpty()) {
            throw new \Exception('Не найдено приоритета для типа документа: '.$type);
        }
        foreach ($items as $item) {
            $data['document_id'] = $document_id;
            $data['ordering'] = $item->ordering;
            $data['user_role'] = $item->user_role;
            $data['is_success'] = false;
            $data['is_active'] = true;
            $this->addPriority($data);
        }
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
            'is_active' => 1,
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

    public function updateDocumentPriority($id, $data)
    {
        DocumentPriority::where('id', $id)->update($data);
    }
}
