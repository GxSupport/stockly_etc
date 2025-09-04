<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Check and add only missing fields
            $columns = Schema::getColumnListing('documents');

            if (! in_array('number', $columns)) {
                $table->string('number')->nullable()->after('user_id')->comment('Document number');
            }
            if (! in_array('main_tool', $columns)) {
                $table->string('main_tool')->nullable()->comment('Main tool/equipment');
            }
            if (! in_array('is_draft', $columns)) {
                $table->tinyInteger('is_draft')->default(1)->comment('0=sent, 1=draft');
            }
            if (! in_array('is_finished', $columns)) {
                $table->tinyInteger('is_finished')->default(0)->comment('Document completed');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['number', 'main_tool', 'is_draft', 'is_finished']);
        });
    }
};
