import * as React from 'react';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';
import { GridStateInitializer } from '../../utils/useGridInitializeState';
export declare const sortingStateInitializer: GridStateInitializer<Pick<DataGridProcessedProps, 'sortModel' | 'initialState' | 'disableMultipleColumnsSorting'>>;
/**
 * @requires useGridRows (event)
 * @requires useGridColumns (event)
 */
export declare const useGridSorting: (apiRef: React.MutableRefObject<GridApiCommunity>, props: Pick<DataGridProcessedProps, 'initialState' | 'sortModel' | 'onSortModelChange' | 'sortingOrder' | 'sortingMode' | 'disableMultipleColumnsSorting'>) => void;
