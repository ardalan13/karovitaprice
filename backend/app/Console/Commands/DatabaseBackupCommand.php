<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Services\AuditLogger;
use PDO;
use Throwable;

class DatabaseBackupCommand extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:backup 
                            {--filename= : Custom filename for the backup (default: auto-generated timestamp)}
                            {--compress : Compress the output file with gzip (.sql.gz)}
                            {--keep= : Keep only the latest N backup files and prune older ones}
                            {--tables= : Comma-separated list of specific tables to dump}
                            {--exclude= : Comma-separated list of tables to exclude}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a full database SQL backup dump and store it safely in the storage directory';

    /**
     * Execute the console command.
     */
    public function handle(): int {
        $startTime = microtime(true);
        $this->info('Starting database backup process...');

        $connection = config('database.default', 'mysql');
        $dbConfig = config("database.connections.{$connection}", []);

        $driver = $dbConfig['driver'] ?? 'mysql';
        $database = $dbConfig['database'] ?? env('DB_DATABASE', 'karovita_db');
        $host = $dbConfig['host'] ?? env('DB_HOST', 'localhost');
        $port = $dbConfig['port'] ?? env('DB_PORT', '3306');
        $username = $dbConfig['username'] ?? env('DB_USERNAME', 'root');
        $password = $dbConfig['password'] ?? env('DB_PASSWORD', '');

        // 1. Prepare storage directory
        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0750, true);
        }

        // Secure directory from web exposure
        $this->secureBackupDirectory($backupDir);

        // 2. Generate file name
        $timestamp = date('Y-m-d_H-i-s');
        $compress = (bool) $this->option('compress');
        $customName = $this->option('filename');

        $baseName = $customName ? pathinfo($customName, PATHINFO_FILENAME) : "backup_{$database}_{$timestamp}";
        $sqlFilePath = $backupDir . DIRECTORY_SEPARATOR . "{$baseName}.sql";
        $finalFilePath = $compress ? "{$sqlFilePath}.gz" : $sqlFilePath;

        $this->comment("Target backup file: {$finalFilePath}");
        $this->comment("Database driver: {$driver} | Database: {$database}");

        // 3. Perform dump based on driver
        $success = false;
        $dumpMethod = 'unknown';

        try {
            if ($driver === 'mysql') {
                $success = $this->dumpMysql($host, $port, $username, $password, $database, $sqlFilePath, $dumpMethod);
            } elseif ($driver === 'sqlite') {
                $success = $this->dumpSqlite($database, $sqlFilePath, $dumpMethod);
            } elseif ($driver === 'pgsql') {
                $success = $this->dumpPostgres($host, $port, $username, $password, $database, $sqlFilePath, $dumpMethod);
            } else {
                $this->warn("Driver '{$driver}' will be dumped using generic PDO scanner.");
                $success = $this->dumpViaPdo($sqlFilePath, $dumpMethod);
            }

            if (!$success || !File::exists($sqlFilePath) || File::size($sqlFilePath) === 0) {
                $this->error('Backup generation failed. Output file is empty or was not created.');
                return Command::FAILURE;
            }

            // 4. Compress if requested
            if ($compress) {
                $this->info('Compressing SQL backup with gzip...');
                $this->compressFile($sqlFilePath, $finalFilePath);
                File::delete($sqlFilePath); // remove uncompressed .sql
            }

            $elapsed = round(microtime(true) - $startTime, 2);
            $fileSizeBytes = File::size($finalFilePath);
            $formattedSize = $this->formatBytes($fileSizeBytes);

            $this->info("✓ Database backup completed successfully in {$elapsed}s!");
            $this->table(
                ['Attribute', 'Value'],
                [
                    ['File Path', $finalFilePath],
                    ['File Size', $formattedSize],
                    ['Method Used', $dumpMethod],
                    ['Execution Time', "{$elapsed} seconds"],
                    ['Timestamp', date('Y-m-d H:i:s T')],
                ]
            );

            // 5. Prune old backups if requested
            $keep = $this->option('keep');
            if ($keep && is_numeric($keep) && (int) $keep > 0) {
                $this->pruneOldBackups($backupDir, (int) $keep);
            }

            // 6. Record Audit Log
            AuditLogger::log('DATABASE_BACKUP_CREATED', "تهیه نسخه پشتیبان پایگاه داده ({$formattedSize}) با متد {$dumpMethod}", [
                'resource_type' => 'database_backup',
                'resource_id' => basename($finalFilePath),
                'details' => [
                    'file_name' => basename($finalFilePath),
                    'file_size' => $formattedSize,
                    'file_size_bytes' => $fileSizeBytes,
                    'database' => $database,
                    'driver' => $driver,
                    'compressed' => $compress,
                    'dump_method' => $dumpMethod,
                    'duration_seconds' => $elapsed,
                ],
                'status' => 'SUCCESS',
            ]);

            return Command::SUCCESS;

        } catch (Throwable $e) {
            $this->error('An error occurred during database backup: ' . $e->getMessage());
            Log::error('Database backup failed', ['exception' => $e]);

            AuditLogger::log('DATABASE_BACKUP_FAILED', 'خطا در فرآیند تهیه نسخه پشتیبان پایگاه داده: ' . $e->getMessage(), [
                'resource_type' => 'database_backup',
                'status' => 'FAILED',
                'details' => ['error' => $e->getMessage()],
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Dump MySQL database (tries mysqldump CLI first, falls back to PDO).
     */
    protected function dumpMysql(string $host, string $port, string $username, string $password, string $database, string $outputPath, string &$method): bool {
        // Attempt native mysqldump CLI if available
        if ($this->isCommandAvailable('mysqldump')) {
            $this->info('Using native mysqldump CLI utility...');
            
            $cmd = sprintf(
                'mysqldump --host=%s --port=%s --user=%s %s --routines --triggers --single-transaction %s > %s 2>&1',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                $password !== '' ? '--password=' . escapeshellarg($password) : '',
                escapeshellarg($database),
                escapeshellarg($outputPath)
            );

            exec($cmd, $output, $returnCode);

            if ($returnCode === 0 && File::exists($outputPath) && File::size($outputPath) > 0) {
                $method = 'mysqldump_cli';
                return true;
            }

            $this->warn('mysqldump command failed or returned errors. Falling back to pure PHP PDO dumper...');
            if (File::exists($outputPath)) {
                File::delete($outputPath);
            }
        }

        // Fallback to pure PDO dumper
        $this->info('Using robust PHP PDO SQL Dumper...');
        $method = 'pdo_fallback';
        return $this->dumpViaPdo($outputPath, $method);
    }

    /**
     * Dump SQLite database.
     */
    protected function dumpSqlite(string $databasePath, string $outputPath, string &$method): bool {
        if (!File::exists($databasePath)) {
            $this->error("SQLite database file not found at: {$databasePath}");
            return false;
        }

        $this->info('Copying SQLite database file...');
        $method = 'sqlite_copy';
        return File::copy($databasePath, $outputPath);
    }

    /**
     * Dump PostgreSQL database.
     */
    protected function dumpPostgres(string $host, string $port, string $username, string $password, string $database, string $outputPath, string &$method): bool {
        if ($this->isCommandAvailable('pg_dump')) {
            $this->info('Using pg_dump CLI utility...');
            $method = 'pg_dump_cli';
            putenv("PGPASSWORD={$password}");
            $cmd = sprintf(
                'pg_dump -h %s -p %s -U %s -F p %s > %s 2>&1',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($database),
                escapeshellarg($outputPath)
            );
            exec($cmd, $output, $returnCode);
            putenv('PGPASSWORD=');
            return ($returnCode === 0);
        }

        $method = 'pdo_fallback';
        return $this->dumpViaPdo($outputPath, $method);
    }

    /**
     * Comprehensive, memory-efficient PHP PDO Table & Data Exporter.
     */
    protected function dumpViaPdo(string $outputPath, string &$method): bool {
        $pdo = DB::connection()->getPdo();
        $handle = fopen($outputPath, 'w');

        if (!$handle) {
            $this->error("Cannot open file for writing: {$outputPath}");
            return false;
        }

        // Write SQL Header
        $dbName = config('database.connections.' . config('database.default') . '.database', 'database');
        $header = "-- ========================================================\n"
            . "-- KaroVita ERP Database Backup Dump (PHP PDO Engine)\n"
            . "-- Database: {$dbName}\n"
            . "-- Generated: " . date('Y-m-d H:i:s') . "\n"
            . "-- Server OS: " . PHP_OS . " | PHP Version: " . PHP_VERSION . "\n"
            . "-- ========================================================\n\n"
            . "SET FOREIGN_KEY_CHECKS=0;\n"
            . "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n"
            . "SET AUTOCOMMIT = 0;\n"
            . "START TRANSACTION;\n"
            . "SET time_zone = '+00:00';\n\n";

        fwrite($handle, $header);

        // Fetch tables list
        $tables = $this->getTablesList($pdo);

        $filterTables = $this->option('tables') ? explode(',', $this->option('tables')) : [];
        $excludeTables = $this->option('exclude') ? explode(',', $this->option('exclude')) : [];

        $dumpedCount = 0;
        foreach ($tables as $table) {
            if (!empty($filterTables) && !in_array($table, $filterTables, true)) {
                continue;
            }
            if (!empty($excludeTables) && in_array($table, $excludeTables, true)) {
                continue;
            }

            $this->line("  -> Exporting table: <comment>{$table}</comment>");

            // 1. Structure
            fwrite($handle, "\n-- --------------------------------------------------------\n");
            fwrite($handle, "-- Table structure for table `{$table}`\n");
            fwrite($handle, "-- --------------------------------------------------------\n\n");
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");

            try {
                $createStmt = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_ASSOC);
                if ($createStmt && isset($createStmt['Create Table'])) {
                    fwrite($handle, $createStmt['Create Table'] . ";\n\n");
                }
            } catch (Throwable $e) {
                $this->warn("     Could not fetch CREATE TABLE for `{$table}`: " . $e->getMessage());
            }

            // 2. Data in batches
            fwrite($handle, "-- Dumping data for table `{$table}`\n\n");
            $rowsCount = 0;
            $query = $pdo->query("SELECT * FROM `{$table}`", PDO::FETCH_ASSOC);

            if ($query) {
                $batch = [];
                $batchSize = 250;

                while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
                    $rowsCount++;
                    $values = [];
                    foreach ($row as $val) {
                        if ($val === null) {
                            $values[] = 'NULL';
                        } elseif (is_numeric($val)) {
                            $values[] = $val;
                        } else {
                            $values[] = $pdo->quote($val);
                        }
                    }
                    $batch[] = '(' . implode(', ', $values) . ')';

                    if (count($batch) >= $batchSize) {
                        fwrite($handle, "INSERT INTO `{$table}` VALUES \n" . implode(",\n", $batch) . ";\n");
                        $batch = [];
                    }
                }

                if (!empty($batch)) {
                    fwrite($handle, "INSERT INTO `{$table}` VALUES \n" . implode(",\n", $batch) . ";\n");
                }
            }

            fwrite($handle, "\n");
            $dumpedCount++;
        }

        // Footer
        $footer = "COMMIT;\n"
            . "SET FOREIGN_KEY_CHECKS=1;\n"
            . "-- Dump completed on " . date('Y-m-d H:i:s') . "\n";
        fwrite($handle, $footer);

        fclose($handle);
        $method = "pdo_engine ({$dumpedCount} tables)";
        return true;
    }

    /**
     * Get list of all tables in the current DB.
     */
    protected function getTablesList(PDO $pdo): array {
        $tables = [];
        try {
            $stmt = $pdo->query('SHOW TABLES');
            while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                $tables[] = $row[0];
            }
        } catch (Throwable $e) {
            // SQLite or Postgres fallback
            try {
                $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
                    $tables[] = $row[0];
                }
            } catch (Throwable $e2) {
                $this->warn('Could not query tables list via standard commands: ' . $e2->getMessage());
            }
        }
        return $tables;
    }

    /**
     * Compress a file using gzip.
     */
    protected function compressFile(string $sourcePath, string $destPath): void {
        $fpOut = gzopen($destPath, 'wb9');
        $fpIn = fopen($sourcePath, 'rb');

        while (!feof($fpIn)) {
            gzwrite($fpOut, fread($fpIn, 1024 * 512));
        }

        fclose($fpIn);
        gzclose($fpOut);
    }

    /**
     * Prune older backups, keeping only the most recent N files.
     */
    protected function pruneOldBackups(string $backupDir, int $keep): void {
        $files = File::glob($backupDir . DIRECTORY_SEPARATOR . 'backup_*');
        
        // Sort files by modified time descending (newest first)
        usort($files, function ($a, $b) {
            return filemtime($b) - filemtime($a);
        });

        if (count($files) > $keep) {
            $toDelete = array_slice($files, $keep);
            $deletedCount = 0;

            foreach ($toDelete as $oldFile) {
                File::delete($oldFile);
                $deletedCount++;
                $this->line("  -> Pruned old backup: <comment>" . basename($oldFile) . "</comment>");
            }

            $this->info("✓ Cleaned up {$deletedCount} old backup(s) (keeping latest {$keep}).");
        }
    }

    /**
     * Secure backup directory with .htaccess and .gitignore.
     */
    protected function secureBackupDirectory(string $dir): void {
        $htaccess = $dir . DIRECTORY_SEPARATOR . '.htaccess';
        if (!File::exists($htaccess)) {
            File::put($htaccess, "Deny from all\n");
        }

        $gitignore = $dir . DIRECTORY_SEPARATOR . '.gitignore';
        if (!File::exists($gitignore)) {
            File::put($gitignore, "*\n!.gitignore\n!.htaccess\n");
        }
    }

    /**
     * Check if a CLI command is available on the system.
     */
    protected function isCommandAvailable(string $command): bool {
        if (!function_exists('exec')) {
            return false;
        }
        $which = (PHP_OS_FAMILY === 'Windows') ? 'where' : 'which';
        exec("{$which} " . escapeshellarg($command) . ' 2>&1', $output, $returnCode);
        return ($returnCode === 0);
    }

    /**
     * Format bytes into human-readable unit.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
