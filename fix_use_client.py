# -*- coding: utf-8 -*-
import os

files = [
    'apps/main-site/src/app/(portal)/partner/properties/page.tsx',
    'apps/main-site/src/components/calendar/CustomDatePicker.tsx',
    'apps/main-site/src/components/calendar/CustomDropdown.tsx',
    'apps/main-site/src/components/calendar/MonthYearSelector.tsx',
    'apps/main-site/src/components/calendar/useCalendarDates.ts',
    'apps/main-site/src/components/kyc/AadhaarOTPVerification.tsx'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.startswith('"use client";'):
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('"use client";\n' + content)
            print(f"Added use client to {filepath}")
    else:
        print(f"File not found: {filepath}")
