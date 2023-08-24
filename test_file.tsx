import React, { memo, useEffect, useState } from 'react';
import './Searchbar.scss';
import { FEATURE_FLAGS } from '../flag';
import { getAutoCompleteWords } from '../ajax';
import lDebounce from 'lodash/debounce';
import TextInput from './TextInput';
import classNames from 'classnames';
import { Utils } from '../utils';

interface SearchbarType {
  defaultTerm: object;
  onSearch?: (value: string) => void;
  showAutocomplete?: boolean;
}

const Searchbar = ({
  defaultTerm,
  onSearch,
  showAutocomplete = false,
}: SearchbarType) => {
  const [value, setValue] = useState<string>(defaultTerm);
  const [isShowAutocomplete, setIsShowAutocomplete] = useState<boolean>(false);
  const [autoCompleteWords, setAutocompleteWords] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState(-1);

  useEffect(() => {
    if (defaultTerm !== value) {
      setValue(defaultTerm);
    }
  }, [defaultTerm]);

  const handleScrollSuggestion = (idx: number) => {
    const xpath = "//ul[contains(@class,'dodoAutocompleteUl')]";
    Utils.onScrollSuggestion(xpath, idx === -1 ? 0 : idx);
  };

  const handleKeydown = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch &&
        onSearch(hoverIndex !== -1 ? autoCompleteWords[hoverIndex] : value);
      setIsShowAutocomplete(false);
    } else if (e.keyCode == '38') {
      // up arrow
      e.preventDefault();
      let nextArrowUpIdx: number = -1;
      const isHighlightBottomSuggestion = hoverIndex - 1 < -1;
      const isNotHighlightSuggestion = hoverIndex - 1 === -1;
      const isHightlightUpperSuggestion = hoverIndex - 1 > -1;
      if (isHighlightBottomSuggestion) {
        nextArrowUpIdx = autoCompleteWords.length - 1;
      } else if (isHightlightUpperSuggestion) {
        nextArrowUpIdx = hoverIndex - 1;
      } else if (isNotHighlightSuggestion) {
        nextArrowUpIdx = -1;
      }
      setHoverIndex(nextArrowUpIdx);
      handleScrollSuggestion(nextArrowUpIdx);
    } else if (e.keyCode == '40') {
      e.preventDefault();
      const isLastSuggestionInList = hoverIndex + 1 >= autoCompleteWords.length;
      const nextArrowDownIdx = isLastSuggestionInList ? -1 : hoverIndex + 1;
      setHoverIndex(nextArrowDownIdx);
      if (nextArrowDownIdx !== -1) {
        handleScrollSuggestion(nextArrowDownIdx);
      }
    }
  };

  const debounceTyping = async (newQueryText: string) => {
    setValue(newQueryText);
    if (newQueryText.length > 2) {
      setIsShowAutocomplete(true);
      const autocompletes = await getAutoCompleteWords(newQueryText);
      setAutocompleteWords(autocompletes);
    }
  };

  const handleTyping = lDebounce(async (e: any) => {
    await debounceTyping(e.target.value);
  }, 500);

  const handleSearch = () => {
    onSearch && onSearch(value);
  };

  const handleInputBlur = (e: any) => {
    setIsShowAutocomplete(false);
  };

  const handleClickAutoComplete = (value: string) => {
    onSearch && onSearch(value);
    setIsShowAutocomplete(false);
  };

  return (
    <div>
      <TextInput
        value={value}
        onChange={(e) => {
          handleTyping(e);
        }}
        onBlur={handleInputBlur}
        onKeyDown={handleKeydown}
        accessories={
          <img
            className={'dodoInputIcon'}
            src={chrome.runtime.getURL('search.svg')}
            onClick={handleSearch}
          />
        }
      />
      {FEATURE_FLAGS.AUTOCOMPLETE && showAutocomplete && (
        <div
          className={`dodoAutocompleteWrapper ${!isShowAutocomplete && 'dodoAutocompleteHide'
            }`}
        >
          <ul className={'dodoAutocompleteUl'}>
            {autoCompleteWords?.map((value, index) => {
              return (
                <li
                  className={classNames(
                    'dodoAutocompleteLi',
                    index === hoverIndex ? 'dodoAutocompleteHover' : ''
                  )}
                  onMouseDown={() => handleClickAutoComplete(value)}
                  key={value}
                >
                  {value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default memo(Searchbar);
