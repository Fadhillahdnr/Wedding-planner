<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Todo = 'belum';
    case InProgress = 'dikerjakan';
    case Done = 'selesai';
    case Skipped = 'dilewati';

    public function isOpen(): bool
    {
        return in_array($this, [self::Todo, self::InProgress], true);
    }
}
