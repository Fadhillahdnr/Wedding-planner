<?php

namespace App\Enums;

enum VendorNeed: string
{
    case Needed = 'needed';
    case Optional = 'optional';
    case NotNeeded = 'not_needed';
}
