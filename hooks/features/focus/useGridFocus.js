import _extends from "@babel/runtime/helpers/esm/extends";
import * as React from 'react';
import { ownerDocument } from '@mui/material/utils';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { useGridLogger } from '../../utils/useGridLogger';
import { useGridApiEventHandler } from '../../utils/useGridApiEventHandler';
import { isNavigationKey } from '../../../utils/keyboardUtils';
import { gridFocusCellSelector } from './gridFocusStateSelector';
import { gridVisibleColumnDefinitionsSelector } from '../columns/gridColumnsSelector';
import { getVisibleRows } from '../../utils/useGridVisibleRows';
import { clamp } from '../../../utils/utils';
export const focusStateInitializer = state => _extends({}, state, {
  focus: {
    cell: null,
    columnHeader: null
  },
  tabIndex: {
    cell: null,
    columnHeader: null
  }
});
/**
 * @requires useGridParamsApi (method)
 * @requires useGridRows (method)
 * @requires useGridEditing (event)
 */

export const useGridFocus = (apiRef, props) => {
  const logger = useGridLogger(apiRef, 'useGridFocus');
  const lastClickedCell = React.useRef(null);
  const publishCellFocusOut = React.useCallback((cell, event) => {
    if (cell) {
      // The row might have been deleted
      if (apiRef.current.getRow(cell.id)) {
        apiRef.current.publishEvent('cellFocusOut', apiRef.current.getCellParams(cell.id, cell.field), event);
      }
    }
  }, [apiRef]);
  const setCellFocus = React.useCallback((id, field) => {
    const focusedCell = gridFocusCellSelector(apiRef);

    if ((focusedCell == null ? void 0 : focusedCell.id) === id && (focusedCell == null ? void 0 : focusedCell.field) === field) {
      return;
    }

    apiRef.current.setState(state => {
      logger.debug(`Focusing on cell with id=${id} and field=${field}`);
      return _extends({}, state, {
        tabIndex: {
          cell: {
            id,
            field
          },
          columnHeader: null
        },
        focus: {
          cell: {
            id,
            field
          },
          columnHeader: null
        }
      });
    });
    apiRef.current.forceUpdate(); // The row might have been deleted

    if (!apiRef.current.getRow(id)) {
      return;
    }

    if (focusedCell) {
      // There's a focused cell but another cell was clicked
      // Publishes an event to notify that the focus was lost
      publishCellFocusOut(focusedCell, {});
    }

    apiRef.current.publishEvent('cellFocusIn', apiRef.current.getCellParams(id, field));
  }, [apiRef, logger, publishCellFocusOut]);
  const setColumnHeaderFocus = React.useCallback((field, event = {}) => {
    const cell = gridFocusCellSelector(apiRef);
    publishCellFocusOut(cell, event);
    apiRef.current.setState(state => {
      logger.debug(`Focusing on column header with colIndex=${field}`);
      return _extends({}, state, {
        tabIndex: {
          columnHeader: {
            field
          },
          cell: null
        },
        focus: {
          columnHeader: {
            field
          },
          cell: null
        }
      });
    });
    apiRef.current.forceUpdate();
  }, [apiRef, logger, publishCellFocusOut]);
  const moveFocusToRelativeCell = React.useCallback((id, field, direction) => {
    let columnIndexToFocus = apiRef.current.getColumnIndex(field);
    let rowIndexToFocus = apiRef.current.getRowIndexRelativeToVisibleRows(id);
    const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef);

    if (direction === 'right') {
      columnIndexToFocus += 1;
    } else if (direction === 'left') {
      columnIndexToFocus -= 1;
    } else {
      rowIndexToFocus += 1;
    }

    const currentPage = getVisibleRows(apiRef, {
      pagination: props.pagination,
      paginationMode: props.paginationMode
    });

    if (columnIndexToFocus >= visibleColumns.length) {
      // Go to next row if we are after the last column
      rowIndexToFocus += 1;

      if (rowIndexToFocus < currentPage.rows.length) {
        // Go to first column of the next row if there's one more row
        columnIndexToFocus = 0;
      }
    } else if (columnIndexToFocus < 0) {
      // Go to previous row if we are before the first column
      rowIndexToFocus -= 1;

      if (rowIndexToFocus >= 0) {
        // Go to last column of the previous if there's one more row
        columnIndexToFocus = visibleColumns.length - 1;
      }
    }

    rowIndexToFocus = clamp(rowIndexToFocus, 0, currentPage.rows.length - 1);
    const rowToFocus = currentPage.rows[rowIndexToFocus];
    const colSpanInfo = apiRef.current.unstable_getCellColSpanInfo(rowToFocus.id, columnIndexToFocus);

    if (colSpanInfo && colSpanInfo.spannedByColSpan) {
      if (direction === 'left' || direction === 'below') {
        columnIndexToFocus = colSpanInfo.leftVisibleCellIndex;
      } else if (direction === 'right') {
        columnIndexToFocus = colSpanInfo.rightVisibleCellIndex;
      }
    }

    columnIndexToFocus = clamp(columnIndexToFocus, 0, visibleColumns.length - 1);
    const columnToFocus = visibleColumns[columnIndexToFocus];
    apiRef.current.setCellFocus(rowToFocus.id, columnToFocus.field);
  }, [apiRef, props.pagination, props.paginationMode]);
  const handleCellDoubleClick = React.useCallback(({
    id,
    field
  }) => {
    apiRef.current.setCellFocus(id, field);
  }, [apiRef]);
  const handleCellKeyDown = React.useCallback((params, event) => {
    // GRID_CELL_NAVIGATION_KEY_DOWN handles the focus on Enter, Tab and navigation keys
    if (event.key === 'Enter' || event.key === 'Tab' || isNavigationKey(event.key)) {
      return;
    }

    apiRef.current.setCellFocus(params.id, params.field);
  }, [apiRef]);
  const handleColumnHeaderFocus = React.useCallback(({
    field
  }, event) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    apiRef.current.setColumnHeaderFocus(field, event);
  }, [apiRef]);
  const handleBlur = React.useCallback(() => {
    logger.debug(`Clearing focus`);
    apiRef.current.setState(state => _extends({}, state, {
      focus: {
        cell: null,
        columnHeader: null
      }
    }));
  }, [logger, apiRef]);
  const handleCellMouseDown = React.useCallback(params => {
    lastClickedCell.current = params;
  }, []);
  const handleDocumentClick = React.useCallback(event => {
    const cellParams = lastClickedCell.current;
    lastClickedCell.current = null;
    const focusedCell = gridFocusCellSelector(apiRef);

    if (!focusedCell) {
      if (cellParams) {
        apiRef.current.setCellFocus(cellParams.id, cellParams.field);
      }

      return;
    }

    if ((cellParams == null ? void 0 : cellParams.id) === focusedCell.id && (cellParams == null ? void 0 : cellParams.field) === focusedCell.field) {
      return;
    }

    const cellElement = apiRef.current.getCellElement(focusedCell.id, focusedCell.field);

    if (cellElement != null && cellElement.contains(event.target)) {
      return;
    }

    if (cellParams) {
      apiRef.current.setCellFocus(cellParams.id, cellParams.field);
    } else {
      apiRef.current.setState(state => _extends({}, state, {
        focus: {
          cell: null,
          columnHeader: null
        }
      }));
      apiRef.current.forceUpdate(); // There's a focused cell but another element (not a cell) was clicked
      // Publishes an event to notify that the focus was lost

      publishCellFocusOut(focusedCell, event);
    }
  }, [apiRef, publishCellFocusOut]);
  const handleCellModeChange = React.useCallback(params => {
    if (params.cellMode === 'view') {
      return;
    }

    const cell = gridFocusCellSelector(apiRef);

    if ((cell == null ? void 0 : cell.id) !== params.id || (cell == null ? void 0 : cell.field) !== params.field) {
      apiRef.current.setCellFocus(params.id, params.field);
    }
  }, [apiRef]);
  const handleRowSet = React.useCallback(() => {
    const cell = gridFocusCellSelector(apiRef); // If the focused cell is in a row which does not exist anymore, then remove the focus

    if (cell && !apiRef.current.getRow(cell.id)) {
      apiRef.current.setState(state => _extends({}, state, {
        focus: {
          cell: null,
          columnHeader: null
        }
      }));
    }
  }, [apiRef]);
  useGridApiMethod(apiRef, {
    setCellFocus,
    setColumnHeaderFocus,
    unstable_moveFocusToRelativeCell: moveFocusToRelativeCell
  }, 'GridFocusApi');
  React.useEffect(() => {
    const doc = ownerDocument(apiRef.current.rootElementRef.current);
    doc.addEventListener('click', handleDocumentClick);
    return () => {
      doc.removeEventListener('click', handleDocumentClick);
    };
  }, [apiRef, handleDocumentClick]);
  useGridApiEventHandler(apiRef, 'columnHeaderBlur', handleBlur);
  useGridApiEventHandler(apiRef, 'cellDoubleClick', handleCellDoubleClick);
  useGridApiEventHandler(apiRef, 'cellMouseDown', handleCellMouseDown);
  useGridApiEventHandler(apiRef, 'cellKeyDown', handleCellKeyDown);
  useGridApiEventHandler(apiRef, 'cellModeChange', handleCellModeChange);
  useGridApiEventHandler(apiRef, 'columnHeaderFocus', handleColumnHeaderFocus);
  useGridApiEventHandler(apiRef, 'rowsSet', handleRowSet);
};