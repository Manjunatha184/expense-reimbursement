import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';

export default function CompactSelect({ value, onChange, options, placeholder = 'Select...', label }) {
  return (
    <div className="min-w-0">
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-left text-sm leading-4 truncate focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span className="block truncate">{options.find(o => o.value === value)?.label || placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500 text-xs">▾</span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg focus:outline-none">
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none px-3 py-2 whitespace-normal break-words ${
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    } ${selected ? 'font-medium' : ''}`
                  }
                >
                  {opt.label}
                </Listbox.Option>
              ))}
              {options.length === 0 && (
                <div className="px-3 py-2 text-gray-500">No options</div>
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
