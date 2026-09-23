<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tizimni «0 holat»ga keltirish: barcha aktlar va ular bilan bog'liq yozuvlar,
 * loglar va vaqtinchalik tizim jadvallari tozalanadi. Ma'lumotnoma jadvallari
 * (foydalanuvchilar, rollar, skladlar, bo'limlar, hujjat turlari, tasdiqlash
 * zanjiri sozlamalari) saqlanib qoladi.
 *
 * Sukut bo'yicha faqat nimalar o'chirilishini ko'rsatadi (dry-run).
 * Haqiqiy o'chirish uchun --force kerak.
 */
class SystemReset extends Command
{
    protected $signature = 'system:reset
        {--force : Haqiqatan o\'chirish (usiz faqat ko\'rsatadi)}
        {--keep-logs : Log va Telescope jadvallariga tegmaslik}
        {--keep-system : Sessiya, cache, queue, token jadvallariga tegmaslik}';

    protected $description = 'Tizimni 0 holatga keltiradi: aktlar, loglar va vaqtinchalik ma\'lumotlar o\'chiriladi, ma\'lumotnomalar qoladi';

    /** @var array<string, list<string>> */
    private const GROUPS = [
        'Aktlar (hujjatlar)' => [
            'documents',
            'document_products',
            'document_priority',
            'document_returned',
            'document_status_log',
            'document_send_telegram',
        ],
        'Loglar' => [
            'log_dismantle',
            'log_istelecom',
            'log_sms',
            'storage_log',
            'telescope_entries',
            'telescope_entries_tags',
            'telescope_monitoring',
        ],
        'Tizim (vaqtinchalik)' => [
            'sessions',
            'cache',
            'cache_locks',
            'jobs',
            'job_batches',
            'failed_jobs',
            'password_reset_tokens',
            'user_reset_password',
            'personal_access_tokens',
        ],
    ];

    /** @var list<string> */
    private const KEPT = [
        'users',
        'user_roles',
        'user_warehouse',
        'warehouse',
        'warehouse_type',
        'dep_list',
        'document_type',
        'document_priority_config',
        'basic_resources',
    ];

    public function handle(): int
    {
        $connection = config('database.default');
        $this->info('Baza: '.$connection.' / '.config("database.connections.{$connection}.database"));
        $this->newLine();

        $rows = [];
        $total = 0;
        foreach ($this->selectedGroups() as $group => $tables) {
            foreach ($tables as $table) {
                if (! Schema::hasTable($table)) {
                    continue;
                }
                $count = DB::table($table)->count();
                $total += $count;
                $rows[] = [$group, $table, $count];
            }
        }

        $this->table(['Guruh', 'Jadval', 'Yozuvlar'], $rows);
        $this->line('O\'chiriladigan yozuvlar jami: '.$total);
        $this->line('Saqlanadi: '.implode(', ', self::KEPT));
        $this->newLine();

        if (! $this->option('force')) {
            $this->warn('Bu faqat ko\'rish rejimi. O\'chirish uchun: php artisan system:reset --force');

            return self::SUCCESS;
        }

        if ($this->input->isInteractive()
            && $this->ask('Bu amalni qaytarib bo\'lmaydi. Davom etish uchun RESET deb yozing') !== 'RESET') {
            $this->error('Bekor qilindi.');

            return self::FAILURE;
        }

        $truncated = $this->truncate(array_column($rows, 1));

        $this->info('Tozalandi: '.count($truncated).' ta jadval.');
        foreach ($truncated as $table) {
            $this->line('  - '.$table);
        }

        return self::SUCCESS;
    }

    /**
     * @return array<string, list<string>>
     */
    private function selectedGroups(): array
    {
        $groups = self::GROUPS;

        if ($this->option('keep-logs')) {
            unset($groups['Loglar']);
        }

        if ($this->option('keep-system')) {
            unset($groups['Tizim (vaqtinchalik)']);
        }

        return $groups;
    }

    /**
     * @param  list<string>  $tables
     * @return list<string>
     */
    private function truncate(array $tables): array
    {
        $truncated = [];

        Schema::disableForeignKeyConstraints();

        try {
            foreach ($tables as $table) {
                DB::table($table)->truncate();
                $truncated[] = $table;
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        return $truncated;
    }
}
