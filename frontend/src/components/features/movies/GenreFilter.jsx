import PropTypes from 'prop-types';
import { formatEnumValue } from '@utils/formatUtils';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { FunnelIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

const GenreFilter = ({ genres, selectedGenre, onChange }) => {
  // Handle genre selection
  const handleGenreSelect = (genre) => {
    onChange(selectedGenre === genre ? null : genre);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <FunnelIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          {selectedGenre ? formatEnumValue(selectedGenre) : 'Filter by Genre'}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {/* All genres option (clear filter) */}
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'flex w-full items-center px-4 py-2 text-sm'
                  )}
                  onClick={() => onChange(null)}
                >
                  <span className="w-5 h-5 mr-2 flex justify-center">
                    {!selectedGenre && <CheckIcon className="h-5 w-5 text-primary-600" />}
                  </span>
                  All Genres
                </button>
              )}
            </Menu.Item>
            
            {/* Genre options */}
            {genres.map((genre) => (
              <Menu.Item key={genre}>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'flex w-full items-center px-4 py-2 text-sm'
                    )}
                    onClick={() => handleGenreSelect(genre)}
                  >
                    <span className="w-5 h-5 mr-2 flex justify-center">
                      {selectedGenre === genre && <CheckIcon className="h-5 w-5 text-primary-600" />}
                    </span>
                    {formatEnumValue(genre)}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

GenreFilter.propTypes = {
  genres: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedGenre: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default GenreFilter;