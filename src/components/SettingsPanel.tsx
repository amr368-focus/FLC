import { useState } from 'react';
import { Settings, RotateCcw, Download, Upload, X, AlertTriangle, LogOut, FileJson, FileSpreadsheet } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  onExportCsv: () => Array<{ filename: string; data: string }>;
  onImportData: (data: string) => boolean;
  onExportJson?: () => string;
  currentUserEmail?: string | null;
  onLogout?: () => void;
}

/**
 * Settings panel with data management options
 */
export function SettingsPanel({
  isOpen,
  onClose,
  onResetData,
  onExportCsv,
  onImportData,
  onExportJson,
  currentUserEmail,
  onLogout,
}: SettingsPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const exports = onExportCsv();
    exports.forEach((file) => {
      const blob = new Blob([file.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const handleExportJson = () => {
    if (!onExportJson) return;
    const data = onExportJson();
    const dateStamp = new Date().toISOString().split('T')[0];
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmo-backup-${dateStamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = onImportData(content);
          if (!success) {
            setImportError('Invalid data format. Please use a valid PMO export file.');
          } else {
            setImportError(null);
            onClose();
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    onResetData();
    setShowResetConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Data Management Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Data Management</h3>
            <div className="space-y-3">
              {onExportJson && (
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  <FileJson className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Export JSON (for backup/import)</div>
                    <div className="text-sm text-gray-500">Download all data as JSON file for backup or bulk editing</div>
                  </div>
                </button>
              )}

              <button
                onClick={handleExportCsv}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Export CSV (for spreadsheets)</div>
                  <div className="text-sm text-gray-500">Download data as CSV files for Excel/Google Sheets</div>
                </div>
              </button>

              <button
                onClick={handleImport}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Upload className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Import JSON Data</div>
                  <div className="text-sm text-gray-500">Load data from a JSON export file (bulk update)</div>
                </div>
              </button>

              {importError && (
                <div className="px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg">
                  {importError}
                </div>
              )}

              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
              >
                <RotateCcw className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">Reset to Demo Data</div>
                  <div className="text-sm text-red-600">Restore all sample data (cannot be undone)</div>
                </div>
              </button>
            </div>
          </div>

          {(currentUserEmail || onLogout) && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Account</h3>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Signed in</div>
                  <div className="text-xs text-gray-500">{currentUserEmail || 'Session active'}</div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
            <p className="text-sm text-gray-500">
              PMO Dashboard - Built for FOCUS Learning Corporation
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Data is stored locally in your browser. Clear browser data to reset.
            </p>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 mx-4 max-w-sm">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Reset All Data?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                This will replace all your current data with the demo data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
