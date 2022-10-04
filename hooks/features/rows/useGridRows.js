import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { useGridLogger } from '../../utils/useGridLogger';
import { gridRowCountSelector, gridRowsLookupSelector, gridRowTreeSelector, gridRowIdsSelector, gridRowGroupingNameSelector, gridRowsIdToIdLookupSelector } from './gridRowsSelector';
import { GridSignature, useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { useGridVisibleRows } from '../../utils/useGridVisibleRows';
import { gridSortedRowIdsSelector } from '../sorting/gridSortingSelector';
import { gridFilteredRowsLookupSelector } from '../filter/gridFilterSelector';
import { getTreeNodeDescendants, createRowsInternalCache, getRowsStateFromCache, getRowIdFromRowModel } from './gridRowsUtils';
import { useGridRegisterPipeApplier } from '../../core/pipeProcessing';
export const rowsStateInitializer = (state, props, apiRef) => {
  apiRef.current.unstable_caches.rows = createRowsInternalCache({
    rows: props.rows,
    getRowId: props.getRowId,
    loading: props.loading
  });
  return _extends({}, state, {
    rows: getRowsStateFromCache({
      apiRef,
      previousTree: null,
      rowCountProp: props.rowCount,
      loadingProp: props.loading
    })
  });
};
export const useGridRows = (apiRef, props) => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Freeze the `rows` prop so developers have a fast failure if they try to use Array.prototype.push().
      Object.freeze(props.rows);
    } catch (error) {// Sometimes, it's impossible to freeze, so we give up on it.
    }
  }

  const logger = useGridLogger(apiRef, 'useGridRows');
  const currentPage = useGridVisibleRows(apiRef, props);
  const lastUpdateMs = React.useRef(Date.now());
  const timeout = React.useRef(null);
  const getRow = React.useCallback(id => {
    var _ref;

    return (_ref = gridRowsLookupSelector(apiRef)[id]) != null ? _ref : null;
  }, [apiRef]);
  const lookup = React.useMemo(() => currentPage.rows.reduce((acc, {
    id
  }, index) => {
    acc[id] = index;
    return acc;
  }, {}), [currentPage.rows]);
  const throttledRowsChange = React.useCallback((newCache, throttle) => {
    const run = () => {
      timeout.current = null;
      lastUpdateMs.current = Date.now();
      apiRef.current.setState(state => _extends({}, state, {
        rows: getRowsStateFromCache({
          apiRef,
          previousTree: gridRowTreeSelector(apiRef),
          rowCountProp: props.rowCount,
          loadingProp: props.loading
        })
      }));
      apiRef.current.publishEvent('rowsSet');
      apiRef.current.forceUpdate();
    };

    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    apiRef.current.unstable_caches.rows = newCache;

    if (!throttle) {
      run();
      return;
    }

    const throttleRemainingTimeMs = props.throttleRowsMs - (Date.now() - lastUpdateMs.current);

    if (throttleRemainingTimeMs > 0) {
      timeout.current = setTimeout(run, throttleRemainingTimeMs);
      return;
    }

    run();
  }, [props.throttleRowsMs, props.rowCount, props.loading, apiRef]);
  /**
   * API METHODS
   */

  const setRows = React.useCallback(rows => {
    logger.debug(`Updating all rows, new length ${rows.length}`);
    throttledRowsChange(createRowsInternalCache({
      rows,
      getRowId: props.getRowId,
      loading: props.loading
    }), true);
  }, [logger, props.getRowId, props.loading, throttledRowsChange]);
  const updateRows = React.useCallback(updates => {
    if (props.signature === GridSignature.DataGrid && updates.length > 1) {
      // TODO: Add test with direct call to `apiRef.current.updateRows` in DataGrid after enabling the `apiRef` on the free plan.
      throw new Error(["MUI: You can't update several rows at once in `apiRef.current.updateRows` on the DataGrid.", 'You need to upgrade to DataGridPro or DataGridPremium component to unlock this feature.'].join('\n'));
    } // we remove duplicate updates. A server can batch updates, and send several updates for the same row in one fn call.


    const uniqueUpdates = new Map();
    updates.forEach(update => {
      const id = getRowIdFromRowModel(update, props.getRowId, 'A row was provided without id when calling updateRows():');

      if (uniqueUpdates.has(id)) {
        uniqueUpdates.set(id, _extends({}, uniqueUpdates.get(id), update));
      } else {
        uniqueUpdates.set(id, update);
      }
    });
    const deletedRowIds = [];
    const prevCache = apiRef.current.unstable_caches.rows;
    const newCache = {
      rowsBeforePartialUpdates: prevCache.rowsBeforePartialUpdates,
      loadingPropBeforePartialUpdates: prevCache.loadingPropBeforePartialUpdates,
      idRowsLookup: _extends({}, prevCache.idRowsLookup),
      idToIdLookup: _extends({}, prevCache.idToIdLookup),
      ids: [...prevCache.ids]
    };
    uniqueUpdates.forEach((partialRow, id) => {
      // eslint-disable-next-line no-underscore-dangle
      if (partialRow._action === 'delete') {
        delete newCache.idRowsLookup[id];
        delete newCache.idToIdLookup[id];
        deletedRowIds.push(id);
        return;
      }

      const oldRow = apiRef.current.getRow(id);

      if (!oldRow) {
        newCache.idRowsLookup[id] = partialRow;
        newCache.idToIdLookup[id] = id;
        newCache.ids.push(id);
        return;
      }

      newCache.idRowsLookup[id] = _extends({}, apiRef.current.getRow(id), partialRow);
    });

    if (deletedRowIds.length > 0) {
      newCache.ids = newCache.ids.filter(id => !deletedRowIds.includes(id));
    }

    throttledRowsChange(newCache, true);
  }, [props.signature, props.getRowId, throttledRowsChange, apiRef]);
  const getRowModels = React.useCallback(() => {
    const allRows = gridRowIdsSelector(apiRef);
    const idRowsLookup = gridRowsLookupSelector(apiRef);
    return new Map(allRows.map(id => [id, idRowsLookup[id]]));
  }, [apiRef]);
  const getRowsCount = React.useCallback(() => gridRowCountSelector(apiRef), [apiRef]);
  const getAllRowIds = React.useCallback(() => gridRowIdsSelector(apiRef), [apiRef]);
  const getRowIndexRelativeToVisibleRows = React.useCallback(id => lookup[id], [lookup]);
  const setRowChildrenExpansion = React.useCallback((id, isExpanded) => {
    const currentNode = apiRef.current.getRowNode(id);

    if (!currentNode) {
      throw new Error(`MUI: No row with id #${id} found`);
    }

    const newNode = _extends({}, currentNode, {
      childrenExpanded: isExpanded
    });

    apiRef.current.setState(state => {
      return _extends({}, state, {
        rows: _extends({}, state.rows, {
          tree: _extends({}, state.rows.tree, {
            [id]: newNode
          })
        })
      });
    });
    apiRef.current.forceUpdate();
    apiRef.current.publishEvent('rowExpansionChange', newNode);
  }, [apiRef]);
  const getRowNode = React.useCallback(id => {
    var _gridRowTreeSelector$;

    return (_gridRowTreeSelector$ = gridRowTreeSelector(apiRef)[id]) != null ? _gridRowTreeSelector$ : null;
  }, [apiRef]);
  const getRowGroupChildren = React.useCallback(({
    skipAutoGeneratedRows = true,
    groupId,
    applySorting,
    applyFiltering
  }) => {
    const tree = gridRowTreeSelector(apiRef);
    let children;

    if (applySorting) {
      const groupNode = tree[groupId];

      if (!groupNode) {
        return [];
      }

      const sortedRowIds = gridSortedRowIdsSelector(apiRef);
      children = [];
      const startIndex = sortedRowIds.findIndex(id => id === groupId) + 1;

      for (let index = startIndex; index < sortedRowIds.length && tree[sortedRowIds[index]].depth > groupNode.depth; index += 1) {
        const id = sortedRowIds[index];
        const node = tree[id];

        if (!skipAutoGeneratedRows || !node.isAutoGenerated) {
          children.push(id);
        }
      }
    } else {
      children = getTreeNodeDescendants(tree, groupId, skipAutoGeneratedRows);
    }

    if (applyFiltering) {
      const filteredRowsLookup = gridFilteredRowsLookupSelector(apiRef);
      children = children.filter(childId => filteredRowsLookup[childId] !== false);
    }

    return children;
  }, [apiRef]);
  const setRowIndex = React.useCallback((rowId, targetIndex) => {
    const allRows = gridRowIdsSelector(apiRef);
    const oldIndex = allRows.findIndex(row => row === rowId);

    if (oldIndex === -1 || oldIndex === targetIndex) {
      return;
    }

    logger.debug(`Moving row ${rowId} to index ${targetIndex}`);
    const updatedRows = [...allRows];
    updatedRows.splice(targetIndex, 0, updatedRows.splice(oldIndex, 1)[0]);
    apiRef.current.setState(state => _extends({}, state, {
      rows: _extends({}, state.rows, {
        ids: updatedRows
      })
    }));
    apiRef.current.publishEvent('rowsSet');
  }, [apiRef, logger]);
  const replaceRows = React.useCallback((firstRowToRender, newRows) => {
    if (props.signature === GridSignature.DataGrid && newRows.length > 1) {
      throw new Error(["MUI: You can't replace rows using `apiRef.current.unstable_replaceRows` on the DataGrid.", 'You need to upgrade to DataGridPro or DataGridPremium component to unlock this feature.'].join('\n'));
    }

    if (newRows.length === 0) {
      return;
    }

    const allRows = gridRowIdsSelector(apiRef);
    const updatedRows = [...allRows];
    const idRowsLookup = gridRowsLookupSelector(apiRef);
    const idToIdLookup = gridRowsIdToIdLookupSelector(apiRef);
    const tree = gridRowTreeSelector(apiRef);

    const updatedIdRowsLookup = _extends({}, idRowsLookup);

    const updatedIdToIdLookup = _extends({}, idToIdLookup);

    const updatedTree = _extends({}, tree);

    const newRowEntries = newRows.map(newRowModel => {
      const rowId = getRowIdFromRowModel(newRowModel, props.getRowId, 'A row was provided without id when calling replaceRows().');
      return {
        id: rowId,
        model: newRowModel
      };
    });
    newRowEntries.forEach((row, index) => {
      const [replacedRowId] = updatedRows.splice(firstRowToRender + index, 1, row.id);
      delete updatedIdRowsLookup[replacedRowId];
      delete updatedIdToIdLookup[replacedRowId];
      delete updatedTree[replacedRowId];
    });
    newRowEntries.forEach(row => {
      const rowTreeNodeConfig = {
        id: row.id,
        parent: null,
        depth: 0,
        groupingKey: null,
        groupingField: null
      };
      updatedIdRowsLookup[row.id] = row.model;
      updatedIdToIdLookup[row.id] = row.id;
      updatedTree[row.id] = rowTreeNodeConfig;
    });
    apiRef.current.setState(state => _extends({}, state, {
      rows: _extends({}, state.rows, {
        idRowsLookup: updatedIdRowsLookup,
        idToIdLookup: updatedIdToIdLookup,
        tree: updatedTree,
        ids: updatedRows
      })
    }));
    apiRef.current.publishEvent('rowsSet');
  }, [apiRef, props.signature, props.getRowId]);
  const rowApi = {
    getRow,
    getRowModels,
    getRowsCount,
    getAllRowIds,
    setRows,
    setRowIndex,
    updateRows,
    setRowChildrenExpansion,
    getRowNode,
    getRowIndexRelativeToVisibleRows,
    getRowGroupChildren,
    unstable_replaceRows: replaceRows
  };
  /**
   * EVENTS
   */

  const groupRows = React.useCallback(() => {
    logger.info(`Row grouping pre-processing have changed, regenerating the row tree`);
    let cache;

    if (apiRef.current.unstable_caches.rows.rowsBeforePartialUpdates === props.rows) {
      // The `props.rows` did not change since the last row grouping
      // We can use the current rows cache which contains the partial updates done recently.
      cache = apiRef.current.unstable_caches.rows;
    } else {
      // The `props.rows` has changed since the last row grouping
      // We must use the new `props.rows` on the new grouping
      // This occurs because this event is triggered before the `useEffect` on the rows when both the grouping pre-processing and the rows changes on the same render
      cache = createRowsInternalCache({
        rows: props.rows,
        getRowId: props.getRowId,
        loading: props.loading
      });
    }

    throttledRowsChange(cache, false);
  }, [logger, apiRef, props.rows, props.getRowId, props.loading, throttledRowsChange]);
  const handleStrategyProcessorChange = React.useCallback(methodName => {
    if (methodName === 'rowTreeCreation') {
      groupRows();
    }
  }, [groupRows]);
  const handleStrategyActivityChange = React.useCallback(() => {
    // `rowTreeCreation` is the only processor ran when `strategyAvailabilityChange` is fired.
    // All the other processors listen to `rowsSet` which will be published by the `groupRows` method below.
    if (apiRef.current.unstable_getActiveStrategy('rowTree') !== gridRowGroupingNameSelector(apiRef)) {
      groupRows();
    }
  }, [apiRef, groupRows]);
  useGridApiEventHandler(apiRef, 'activeStrategyProcessorChange', handleStrategyProcessorChange);
  useGridApiEventHandler(apiRef, 'strategyAvailabilityChange', handleStrategyActivityChange);
  /**
   * APPLIERS
   */

  const applyHydrateRowsProcessor = React.useCallback(() => {
    apiRef.current.setState(state => _extends({}, state, {
      rows: _extends({}, state.rows, apiRef.current.unstable_applyPipeProcessors('hydrateRows', state.rows.groupingResponseBeforeRowHydration))
    }));
    apiRef.current.publishEvent('rowsSet');
    apiRef.current.forceUpdate();
  }, [apiRef]);
  useGridRegisterPipeApplier(apiRef, 'hydrateRows', applyHydrateRowsProcessor);
  useGridApiMethod(apiRef, rowApi, 'GridRowApi');
  /**
   * EFFECTS
   */

  React.useEffect(() => {
    return () => {
      if (timeout.current !== null) {
        clearTimeout(timeout.current);
      }
    };
  }, []); // The effect do not track any value defined synchronously during the 1st render by hooks called after `useGridRows`
  // As a consequence, the state generated by the 1st run of this useEffect will always be equal to the initialization one

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const areNewRowsAlreadyInState = apiRef.current.unstable_caches.rows.rowsBeforePartialUpdates === props.rows;
    const isNewLoadingAlreadyInState = apiRef.current.unstable_caches.rows.loadingPropBeforePartialUpdates === props.loading; // The new rows have already been applied (most likely in the `'rowGroupsPreProcessingChange'` listener)

    if (areNewRowsAlreadyInState) {
      // If the loading prop has changed, we need to update its value in the state because it won't be done by `throttledRowsChange`
      if (!isNewLoadingAlreadyInState) {
        apiRef.current.setState(state => _extends({}, state, {
          rows: _extends({}, state.rows, {
            loading: props.loading
          })
        }));
        apiRef.current.unstable_caches.rows.loadingPropBeforePartialUpdates = props.loading;
        apiRef.current.forceUpdate();
      }

      return;
    }

    logger.debug(`Updating all rows, new length ${props.rows.length}`);
    throttledRowsChange(createRowsInternalCache({
      rows: props.rows,
      getRowId: props.getRowId,
      loading: props.loading
    }), false);
  }, [props.rows, props.rowCount, props.getRowId, props.loading, logger, throttledRowsChange, apiRef]);
};