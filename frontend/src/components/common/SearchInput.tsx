import type { FormEvent } from "react";

import figmaSearchIcon from "../../assets/figma/icon-search-input.svg";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (keyword: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  disabled?: boolean;
  variant?: "default" | "figma";
}

function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = "제철 키워드를 입력해 주세요",
  buttonLabel = "검색",
  disabled = false,
  variant = "default",
}: SearchInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(value.trim());
  };

  return (
    <form className={variant === "figma" ? "search-input search-input--figma" : "search-input"} onSubmit={handleSubmit}>
      <label className="screen-reader-only" htmlFor="seasonal-search">
        제철 키워드
      </label>
      {variant === "figma" ? (
        <img className="search-input__icon" src={figmaSearchIcon} alt="" />
      ) : null}
      <input
        id="seasonal-search"
        className="search-input__field"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {variant === "default" ? (
        <button className="button button--primary" type="submit" disabled={disabled}>
          {buttonLabel}
        </button>
      ) : null}
    </form>
  );
}

export default SearchInput;
