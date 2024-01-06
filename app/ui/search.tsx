'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // this is optional, if I don't want to fire the search with every change on user input (every letter or keystroke). Install: npm i use-debounce

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams(); // useSearchParams() accesses the browser's current URL. I can't use...
  //the automatic Next JS searchParams b/c 1) this is not a page and...
  //2) this is a client component, not a server component so can't also pass searchParams from the parent page...
  // b/c it won't be dynamic as the client interacts with the component but would need to go back to the server.
  // Instead, I get the client URL using the hook useSearchParams() (hooks are client/dynamic functions).
  const pathname = usePathname();
  const { replace } = useRouter();

  // function handleSearch(searchQuery: string) {     // this is without useDebouncedCallback
  const handleSearch = useDebouncedCallback((searchQuery) => {
    console.log(`Searching... ${searchQuery}`);
    const params = new URLSearchParams(searchParams); // searchParams has the browser's current URL, and...
    // URLSearchParams provides read and write access to the query of a URL
    params.set('page', '1'); // resets page to 1 on every new query search
    if (searchQuery) {
      params.set('query', searchQuery); // replaces query key with current input (instead of browser's URL)
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`); // replaces browser's URL to reflect new user input (searchQuery)
  }, 350); // this is using useDebouncedCallback (wait 350ms from last keystroke => user stopped or paused typing)
  // } // // this is without useDebouncedCallback
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
