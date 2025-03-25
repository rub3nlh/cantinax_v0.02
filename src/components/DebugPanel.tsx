import React, { useState, useEffect } from 'react';
import JsonView from '@microlink/react-json-view';
import { X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface Log {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info';
  data: any[];
}

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Override console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    // Create new console methods that store logs
    console.log = (...args) => {
      originalConsole.log.apply(console, args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.error.apply(console, args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn.apply(console, args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalConsole.info.apply(console, args);
      addLog('info', args);
    };

    // Restore original console on cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, []);

  const addLog = (type: Log['type'], data: any[]) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      type,
      data
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const renderLogContent = (item: any) => {
    if (item === null) return <span className="text-gray-500">null</span>;
    if (item === undefined) return <span className="text-gray-500">undefined</span>;
    
    if (typeof item === 'object') {
      try {
        return (
          <JsonView
            src={item}
            name={null}
            collapsed={2}
            displayDataTypes={false}
            enableClipboard={false}
            style={{
              padding: '0.5rem 0',
              backgroundColor: 'transparent',
              fontFamily: 'monospace'
            }}
          />
        );
      } catch (err) {
        return <pre className="whitespace-pre-wrap font-mono text-sm text-red-500">Error displaying object: {String(err)}</pre>;
      }
    }
    
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {String(item)}
      </pre>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
      >
        Show Logs
      </button>
    );
  }

  return (
    <div
      className={`fixed right-4 bg-white rounded-lg shadow-xl transition-all duration-200 z-50 ${
        isMinimized ? 'bottom-4 w-64' : 'bottom-4 w-96 max-h-[80vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-red-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Debug Console</h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
            {logs.length} logs
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-white/20 rounded"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="overflow-y-auto max-h-[calc(80vh-40px)]">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 border-b ${
                log.type === 'error'
                  ? 'bg-red-50'
                  : log.type === 'warn'
                  ? 'bg-yellow-50'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    log.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : log.type === 'warn'
                      ? 'bg-yellow-100 text-yellow-800'
                      : log.type === 'info'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {log.type.toUpperCase()}
                </span>
              </div>
              {log.data.map((item, i) => (
                <div key={i} className="text-sm">
                  {renderLogContent(item)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};