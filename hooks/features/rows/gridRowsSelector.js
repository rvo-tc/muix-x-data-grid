import { createSelector } from '../../../utils/createSelector';
export const gridRowsStateSelector = state => state.rows;
export const gridRowCountSelector = createSelector(gridRowsStateSelector, rows => rows.totalRowCount);
export const gridRowsLoadingSelector = createSelector(gridRowsStateSelector, rows => rows.loading);
export const gridTopLevelRowCountSelector = createSelector(gridRowsStateSelector, rows => rows.totalTopLevelRowCount);
export const gridRowsLookupSelector = createSelector(gridRowsStateSelector, rows => rows.idRowsLookup);
export const gridRowsIdToIdLookupSelector = createSelector(gridRowsStateSelector, rows => rows.idToIdLookup);
export const gridRowTreeSelector = createSelector(gridRowsStateSelector, rows => rows.tree);
export const gridRowGroupingNameSelector = createSelector(gridRowsStateSelector, rows => rows.groupingName);
export const gridRowTreeDepthSelector = createSelector(gridRowsStateSelector, rows => rows.treeDepth);
export const gridRowIdsSelector = createSelector(gridRowsStateSelector, rows => rows.ids);
/**
 * @ignore - do not document.
 */

export const gridAdditionalRowGroupsSelector = createSelector(gridRowsStateSelector, rows => rows == null ? void 0 : rows.additionalRowGroups);
/**
 * @ignore - do not document.
 */

export const gridPinnedRowsSelector = createSelector(gridAdditionalRowGroupsSelector, additionalRowGroups => additionalRowGroups == null ? void 0 : additionalRowGroups.pinnedRows);
/**
 * @ignore - do not document.
 */

export const gridPinnedRowsCountSelector = createSelector(gridPinnedRowsSelector, pinnedRows => {
  var _pinnedRows$top, _pinnedRows$bottom;

  return ((pinnedRows == null ? void 0 : (_pinnedRows$top = pinnedRows.top) == null ? void 0 : _pinnedRows$top.length) || 0) + ((pinnedRows == null ? void 0 : (_pinnedRows$bottom = pinnedRows.bottom) == null ? void 0 : _pinnedRows$bottom.length) || 0);
});