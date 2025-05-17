'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Trash2, Plus } from 'lucide-react';

export type TableData = {
  headers: string[];
  rows: string[][];
};

type TableComponentProps = {
  data: TableData;
  onChange?: (data: TableData) => void;
};

export type TableComponentHandle = {
  getCurrentData: () => TableData;
};

const TableComponent = forwardRef<TableComponentHandle, TableComponentProps>(function TableComponent({ 
  data,
  onChange,
}, ref) {
  useImperativeHandle(ref, () => ({
    getCurrentData: () => data,
  }), [data]);

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...data.headers];
    newHeaders[index] = value;
    onChange && onChange({ ...data, headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...data.rows];
    if (newRows[rowIndex]) {
      const newRow = [...newRows[rowIndex]];
      newRow[colIndex] = value;
      newRows[rowIndex] = newRow;
      onChange && onChange({ ...data, rows: newRows });
    }
  };

  const addColumn = () => {
    const newHeaders = [...data.headers, `Столбец ${data.headers.length + 1}`];
    const newRows = data.rows.map(row => [...row, '']);
    onChange && onChange({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (data.headers.length <= 1) return;
    const newHeaders = data.headers.filter((_, i) => i !== index);
    const newRows = data.rows.map(row => row.filter((_, i) => i !== index));
    onChange && onChange({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = Array(data.headers.length).fill('');
    onChange && onChange({ ...data, rows: [...data.rows, newRow] });
  };

  const removeRow = (index: number) => {
    if (data.rows.length <= 1) return;
    onChange && onChange({ ...data, rows: data.rows.filter((_, i) => i !== index) });
  };

  return (
    <div className="table-component overflow-auto rounded-lg shadow-sm">
      <table className="min-w-full border-collapse bg-zinc-800">
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index} className="border border-zinc-700 bg-zinc-900 p-2 relative">
                <input
                  type="text"
                  value={header}
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                  className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 font-medium text-zinc-200"
                  placeholder={`Столбец ${index + 1}`}
                />
                {data.headers.length > 1 && (
                  <button
                    onClick={() => removeColumn(index)}
                    className="absolute top-1 right-1 text-zinc-500 hover:text-red-500 transition-colors"
                    title="Удалить столбец"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </th>
            ))}
            <th className="border border-zinc-700 bg-zinc-900 p-2 w-10">
              <button
                onClick={addColumn}
                className="w-full text-zinc-500 hover:text-blue-400 flex items-center justify-center transition-colors"
                title="Добавить столбец"
              >
                <Plus className="w-4 h-4" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-700">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-zinc-700 transition-colors">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border border-zinc-700 p-2">
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 text-zinc-300"
                    placeholder="Введите текст..."
                  />
                </td>
              ))}
              <td className="border border-zinc-700 p-1 w-10">
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="w-full text-zinc-500 hover:text-red-500 flex items-center justify-center transition-colors"
                  title="Удалить строку"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={data.headers.length + 1} className="border border-zinc-700 p-1">
              <button
                onClick={addRow}
                className="w-full text-zinc-500 hover:text-blue-400 flex items-center justify-center py-1 transition-colors"
                title="Добавить строку"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="text-sm">Добавить строку</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default TableComponent; 