/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>ABC INTERNATIONAL UNIVERSITY DELHI · Directorate of Examinations</span>
        </div>
        <p className="mt-2 sm:mt-0 text-xs text-slate-400 dark:text-slate-500">
          Confidential & Protected Assessment Portal · Session 2025–2026
        </p>
      </div>
    </footer>
  );
};
