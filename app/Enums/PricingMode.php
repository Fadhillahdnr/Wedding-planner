<?php

namespace App\Enums;

enum PricingMode: string
{
    case Fixed = 'fixed';
    case PerGuest = 'per_guest';
}
