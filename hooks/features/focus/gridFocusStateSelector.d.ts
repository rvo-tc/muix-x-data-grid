import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { GridFocusState, GridTabIndexState } from './gridFocusState';
export declare const gridFocusStateSelector: (state: GridStateCommunity) => GridFocusState;
export declare const gridFocusCellSelector: import("../../../utils/createSelector").OutputSelector<GridStateCommunity, import("./gridFocusState").GridCellIdentifier | null>;
export declare const gridFocusColumnHeaderSelector: import("../../../utils/createSelector").OutputSelector<GridStateCommunity, import("./gridFocusState").GridColumnIdentifier | null>;
export declare const gridTabIndexStateSelector: (state: GridStateCommunity) => GridTabIndexState;
export declare const gridTabIndexCellSelector: import("../../../utils/createSelector").OutputSelector<GridStateCommunity, import("./gridFocusState").GridCellIdentifier | null>;
export declare const gridTabIndexColumnHeaderSelector: import("../../../utils/createSelector").OutputSelector<GridStateCommunity, import("./gridFocusState").GridColumnIdentifier | null>;
