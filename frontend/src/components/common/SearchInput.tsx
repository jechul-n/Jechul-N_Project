import type { FormEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (keyword: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  disabled?: boolean;
}

function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "제철 키워드를 입력해 주세요",
  buttonLabel = "검색",
  disabled = false,
}: SearchInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form className="search-input" onSubmit={handleSubmit}>
      <label className="screen-reader-only" htmlFor="seasonal-search">
        제철 키워드
      </label>
      <input
        id="seasonal-search"
        className="search-input__field"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button className="button button--primary" type="submit" disabled={disabled}>
        {buttonLabel}
      </button>
    </form>
  );
}

export default SearchInput;
