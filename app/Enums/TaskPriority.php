<?php

namespace App\Enums;

enum TaskPriority: string
{
    case Low = 'rendah';
    case Normal = 'normal';
    case High = 'tinggi';
}
