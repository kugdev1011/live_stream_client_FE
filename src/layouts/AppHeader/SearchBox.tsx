import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FEED_SEARCH_PATH, SEARCH_QUERY_KEYWORD } from '@/data/route';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBox = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputValue(e.target.value);

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  const handleSearch = () => {
    const _query = inputValue.trim();
    if (_query) {
      onSearch(_query);
      navigate(
        `${FEED_SEARCH_PATH}?${SEARCH_QUERY_KEYWORD}=${encodeURIComponent(
          _query
        )}`
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search).get(
      SEARCH_QUERY_KEYWORD
    );
    if (query) setInputValue(query);
  }, [location]);

  return (
    <div className="relative">
      <Input
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        type="text"
        placeholder="Search"
        className="pl-4 py-[16px] text-sm bg-zinc-200/50 dark:bg-muted/50 border-none focus-visible:outline focus-visible:dark:outline-gray-700 outline-gray-300 min-w-[300px]"
      />
      {inputValue && (
        <X
          className="w-3 h-3 absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
          onClick={handleClear}
        />
      )}
      <Button
        variant="secondary"
        className="absolute right-0 top-0 px-4 rounded-none rounded-tr-md rounded-br-md border-none focus-visible:outline focus-visible:dark:outline-gray-700 outline-gray-300"
        onClick={handleSearch}
      >
        <Search />
      </Button>
    </div>
  );
};

export default SearchBox;
