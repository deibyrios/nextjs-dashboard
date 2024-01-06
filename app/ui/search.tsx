'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // useSearchParams() accesses the browser's current URL
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSearch(searchQuery: string) {
    const params = new URLSearchParams(searchParams); // searchParams has the browser's current URL
    if (searchQuery) {
      params.set('query', searchQuery); // replaces query key with current input (instead of browser's URL)
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`); // replaces browser's URL to reflect new user input (searchQuery)
  }
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()} // searchParams has the browser's current URL, so the input is in sync if user modifies broweser URL and navigates/refresh
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
