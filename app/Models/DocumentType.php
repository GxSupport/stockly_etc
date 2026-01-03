<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\DocumentType Hujjat turi modeli
 *
 * @property int $id ID raqami
 * @property string $code Hujjat kodi
 * @property string $title Hujjat nomi
 * @property int $workflow_type Workflow turi (1=ketma-ket, 2=to'g'ridan-to'g'ri)
 * @property bool $requires_deputy_approval Zam director tasdiqlashi kerakmi
 * @property Carbon|null $created_at Yaratilgan vaqt
 * @property Carbon|null $updated_at Yangilangan vaqt
 */
class DocumentType extends Model
{
    use HasFactory;

    // Workflow turlari
    public const WORKFLOW_SEQUENTIAL = 1;     // Ketma-ket tasdiqlash

    public const WORKFLOW_DIRECT = 2;          // To'g'ridan-to'g'ri tayinlash

    protected $table = 'document_type';

    protected $fillable = [
        'code',
        'title',
        'workflow_type',
        'requires_deputy_approval',
    ];

    protected function casts(): array
    {
        return [
            'workflow_type' => 'integer',
            'requires_deputy_approval' => 'boolean',
        ];
    }

    public function isDirectWorkflow(): bool
    {
        return $this->workflow_type === self::WORKFLOW_DIRECT;
    }

    public function isSequentialWorkflow(): bool
    {
        return $this->workflow_type === self::WORKFLOW_SEQUENTIAL;
    }
}
