<?php

namespace App\Enums;

enum CandidateStatus: string
{
    case Shortlist = 'shortlist';
    case Contacted = 'dihubungi';
    case Surveyed = 'survei';
    case Negotiating = 'negosiasi';
    case Chosen = 'terpilih';
    case Rejected = 'ditolak';
}
