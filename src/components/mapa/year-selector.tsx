"use client";

interface Props {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
}

export default function YearSelector({ years, selectedYear, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Ano:
      </label>
      <select
        value={selectedYear}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
