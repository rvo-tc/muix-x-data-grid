/// <reference types="react" />
import { AutocompleteProps } from '@mui/material/Autocomplete';
import { GridFilterInputValueProps } from './GridFilterInputValueProps';
import type { ValueOptions } from '../../../models/colDef/gridColDef';
export interface GridFilterInputMultipleSingleSelectProps extends Omit<AutocompleteProps<ValueOptions, true, false, true>, 'options' | 'renderInput' | 'onChange' | 'value' | 'id' | 'filterOptions' | 'isOptionEqualToValue' | 'limitTags' | 'multiple' | 'color'>, GridFilterInputValueProps {
    type?: 'singleSelect';
}
declare function GridFilterInputMultipleSingleSelect(props: GridFilterInputMultipleSingleSelectProps): JSX.Element;
declare namespace GridFilterInputMultipleSingleSelect {
    var propTypes: any;
}
export { GridFilterInputMultipleSingleSelect };
