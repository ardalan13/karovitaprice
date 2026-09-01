<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel {
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void {
        // Daily automated database backup with gzip compression and 14-day retention
        $schedule->command('db:backup --compress --keep=14')
            ->dailyAt('02:00')
            ->name('database-daily-backup')
            ->withoutOverlapping()
            ->runInBackground();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
