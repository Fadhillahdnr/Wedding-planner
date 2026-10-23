<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Planned = 'direncanakan';
    case Due = 'jatuh_tempo';
    case Paid = 'lunas';
    case Cancelled = 'dibatalkan';
}
