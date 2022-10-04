import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _extends from "@babel/runtime/helpers/esm/extends";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["selected", "rowId", "row", "index", "style", "position", "rowHeight", "className", "visibleColumns", "renderedColumns", "containerWidth", "firstColumnToRender", "lastColumnToRender", "cellFocus", "cellTabIndex", "editRowsState", "isLastVisible", "onClick", "onDoubleClick", "onMouseEnter", "onMouseLeave"],
    _excluded2 = ["changeReason"];
import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unstable_composeClasses as composeClasses, useForkRef } from '@mui/material';
import { GridEditModes, GridRowModes, GridCellModes } from '../models/gridEditRowModel';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { getDataGridUtilityClass, gridClasses } from '../constants/gridClasses';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { gridColumnsTotalWidthSelector } from '../hooks/features/columns/gridColumnsSelector';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { useGridVisibleRows } from '../hooks/utils/useGridVisibleRows';
import { findParentElementFromClassName } from '../utils/domUtils';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '../colDef/gridCheckboxSelectionColDef';
import { GRID_ACTIONS_COLUMN_TYPE } from '../colDef/gridActionsColDef';
import { GRID_DETAIL_PANEL_TOGGLE_FIELD } from '../constants/gridDetailPanelToggleField';
import { gridSortModelSelector } from '../hooks/features/sorting/gridSortingSelector';
import { gridRowTreeDepthSelector } from '../hooks/features/rows/gridRowsSelector';
import { gridDensityHeaderGroupingMaxDepthSelector } from '../hooks/features/density/densitySelector';
import { randomNumberBetween } from '../utils/utils';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";

var useUtilityClasses = function useUtilityClasses(ownerState) {
  var editable = ownerState.editable,
      editing = ownerState.editing,
      selected = ownerState.selected,
      isLastVisible = ownerState.isLastVisible,
      rowHeight = ownerState.rowHeight,
      classes = ownerState.classes;
  var slots = {
    root: ['row', selected && 'selected', editable && 'row--editable', editing && 'row--editing', isLastVisible && 'row--lastVisible', rowHeight === 'auto' && 'row--dynamicHeight']
  };
  return composeClasses(slots, getDataGridUtilityClass, classes);
};

var EmptyCell = function EmptyCell(_ref) {
  var width = _ref.width;

  if (!width) {
    return null;
  }

  var style = {
    width: width
  };
  return /*#__PURE__*/_jsx("div", {
    className: "MuiDataGrid-cell",
    style: style
  }); // TODO change to .MuiDataGrid-emptyCell or .MuiDataGrid-rowFiller
};

var GridRow = /*#__PURE__*/React.forwardRef(function GridRow(props, refProp) {
  var _apiRef$current$getRo;

  var selected = props.selected,
      rowId = props.rowId,
      row = props.row,
      index = props.index,
      styleProp = props.style,
      position = props.position,
      rowHeight = props.rowHeight,
      className = props.className,
      visibleColumns = props.visibleColumns,
      renderedColumns = props.renderedColumns,
      containerWidth = props.containerWidth,
      firstColumnToRender = props.firstColumnToRender,
      lastColumnToRender = props.lastColumnToRender,
      cellFocus = props.cellFocus,
      cellTabIndex = props.cellTabIndex,
      editRowsState = props.editRowsState,
      _props$isLastVisible = props.isLastVisible,
      isLastVisible = _props$isLastVisible === void 0 ? false : _props$isLastVisible,
      onClick = props.onClick,
      onDoubleClick = props.onDoubleClick,
      onMouseEnter = props.onMouseEnter,
      onMouseLeave = props.onMouseLeave,
      other = _objectWithoutProperties(props, _excluded);

  var apiRef = useGridApiContext();
  var ref = React.useRef(null);
  var rootProps = useGridRootProps();
  var currentPage = useGridVisibleRows(apiRef, rootProps);
  var columnsTotalWidth = useGridSelector(apiRef, gridColumnsTotalWidthSelector);
  var sortModel = useGridSelector(apiRef, gridSortModelSelector);
  var treeDepth = useGridSelector(apiRef, gridRowTreeDepthSelector);
  var headerGroupingMaxDepth = useGridSelector(apiRef, gridDensityHeaderGroupingMaxDepthSelector);
  var handleRef = useForkRef(ref, refProp);
  var ariaRowIndex = index + headerGroupingMaxDepth + 2; // 1 for the header row and 1 as it's 1-based

  var _ref2 = (_apiRef$current$getRo = apiRef.current.getRootDimensions()) != null ? _apiRef$current$getRo : {
    hasScrollX: false,
    hasScrollY: false
  },
      hasScrollX = _ref2.hasScrollX,
      hasScrollY = _ref2.hasScrollY;

  var ownerState = {
    selected: selected,
    isLastVisible: isLastVisible,
    classes: rootProps.classes,
    editing: apiRef.current.getRowMode(rowId) === GridRowModes.Edit,
    editable: rootProps.editMode === GridEditModes.Row,
    rowHeight: rowHeight
  };
  var classes = useUtilityClasses(ownerState);
  React.useLayoutEffect(function () {
    if (rowHeight === 'auto' && ref.current && typeof ResizeObserver === 'undefined') {
      // Fallback for IE
      apiRef.current.unstable_storeRowHeightMeasurement(rowId, ref.current.clientHeight, position);
    }
  }, [apiRef, rowHeight, rowId, position]);
  React.useLayoutEffect(function () {
    if (currentPage.range) {
      // The index prop is relative to the rows from all pages. As example, the index prop of the
      // first row is 5 if pageSize=5 and page=1. However, the index used by the virtualization
      // doesn't care about pagination and considers the rows from the current page only, so the
      // first row always has index=0. We need to subtract the index of the first row to make it
      // compatible with the index used by the virtualization.
      var rowIndex = apiRef.current.getRowIndexRelativeToVisibleRows(rowId); // pinned rows are not part of the visible rows

      if (rowIndex != null) {
        apiRef.current.unstable_setLastMeasuredRowIndex(rowIndex);
      }
    }

    var rootElement = ref.current;
    var hasFixedHeight = rowHeight !== 'auto';

    if (!rootElement || hasFixedHeight || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    var resizeObserver = new ResizeObserver(function (entries) {
      var _entries = _slicedToArray(entries, 1),
          entry = _entries[0];

      var height = entry.borderBoxSize && entry.borderBoxSize.length > 0 ? entry.borderBoxSize[0].blockSize : entry.contentRect.height;
      apiRef.current.unstable_storeRowHeightMeasurement(rowId, height, position);
    });
    resizeObserver.observe(rootElement);
    return function () {
      return resizeObserver.disconnect();
    };
  }, [apiRef, currentPage.range, index, rowHeight, rowId, position]);
  var publish = React.useCallback(function (eventName, propHandler) {
    return function (event) {
      // Ignore portal
      // The target is not an element when triggered by a Select inside the cell
      // See https://github.com/mui/material-ui/issues/10534
      if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) {
        return;
      } // The row might have been deleted


      if (!apiRef.current.getRow(rowId)) {
        return;
      }

      apiRef.current.publishEvent(eventName, apiRef.current.getRowParams(rowId), event);

      if (propHandler) {
        propHandler(event);
      }
    };
  }, [apiRef, rowId]);
  var publishClick = React.useCallback(function (event) {
    var cell = findParentElementFromClassName(event.target, gridClasses.cell);
    var field = cell == null ? void 0 : cell.getAttribute('data-field'); // Check if the field is available because the cell that fills the empty
    // space of the row has no field.

    if (field) {
      // User clicked in the checkbox added by checkboxSelection
      if (field === GRID_CHECKBOX_SELECTION_COL_DEF.field) {
        return;
      } // User opened a detail panel


      if (field === GRID_DETAIL_PANEL_TOGGLE_FIELD) {
        return;
      } // User reorders a row


      if (field === '__reorder__') {
        return;
      } // User is editing a cell


      if (apiRef.current.getCellMode(rowId, field) === GridCellModes.Edit) {
        return;
      } // User clicked a button from the "actions" column type


      var column = apiRef.current.getColumn(field);

      if (column.type === GRID_ACTIONS_COLUMN_TYPE) {
        return;
      }
    }

    publish('rowClick', onClick)(event);
  }, [apiRef, onClick, publish, rowId]);
  var getCell = React.useCallback(function (column, cellProps) {
    var _rootProps$components;

    var cellParams = apiRef.current.getCellParams(rowId, column.field);
    var classNames = [];
    var disableDragEvents = rootProps.disableColumnReorder && column.disableReorder || !rootProps.rowReordering && !!sortModel.length && treeDepth > 1 && Object.keys(editRowsState).length > 0;

    if (column.cellClassName) {
      classNames.push(clsx(typeof column.cellClassName === 'function' ? column.cellClassName(cellParams) : column.cellClassName));
    }

    var editCellState = editRowsState[rowId] ? editRowsState[rowId][column.field] : null;
    var content = null;

    if (editCellState == null && column.renderCell) {
      var _rootProps$classes;

      content = column.renderCell(_extends({}, cellParams, {
        api: apiRef.current
      })); // TODO move to GridCell

      classNames.push(clsx(gridClasses['cell--withRenderer'], (_rootProps$classes = rootProps.classes) == null ? void 0 : _rootProps$classes['cell--withRenderer']));
    }

    if (editCellState != null && column.renderEditCell) {
      var _rootProps$classes2;

      var updatedRow = row;

      if (apiRef.current.unstable_getRowWithUpdatedValues) {
        // Only the new editing API has this method
        updatedRow = apiRef.current.unstable_getRowWithUpdatedValues(rowId, column.field);
      }

      var changeReason = editCellState.changeReason,
          editCellStateRest = _objectWithoutProperties(editCellState, _excluded2);

      var params = _extends({}, cellParams, {
        row: updatedRow
      }, editCellStateRest, {
        api: apiRef.current
      });

      content = column.renderEditCell(params); // TODO move to GridCell

      classNames.push(clsx(gridClasses['cell--editing'], (_rootProps$classes2 = rootProps.classes) == null ? void 0 : _rootProps$classes2['cell--editing']));
    }

    if (rootProps.getCellClassName) {
      // TODO move to GridCell
      classNames.push(rootProps.getCellClassName(cellParams));
    }

    var hasFocus = cellFocus !== null && cellFocus.id === rowId && cellFocus.field === column.field;
    var tabIndex = cellTabIndex !== null && cellTabIndex.id === rowId && cellTabIndex.field === column.field && cellParams.cellMode === 'view' ? 0 : -1;
    return /*#__PURE__*/_jsx(rootProps.components.Cell, _extends({
      value: cellParams.value,
      field: column.field,
      width: cellProps.width,
      rowId: rowId,
      height: rowHeight,
      showRightBorder: cellProps.showRightBorder,
      formattedValue: cellParams.formattedValue,
      align: column.align || 'left',
      cellMode: cellParams.cellMode,
      colIndex: cellProps.indexRelativeToAllColumns,
      isEditable: cellParams.isEditable,
      hasFocus: hasFocus,
      tabIndex: tabIndex,
      className: clsx(classNames),
      colSpan: cellProps.colSpan,
      disableDragEvents: disableDragEvents
    }, (_rootProps$components = rootProps.componentsProps) == null ? void 0 : _rootProps$components.cell, {
      children: content
    }), column.field);
  }, [apiRef, cellTabIndex, editRowsState, cellFocus, rootProps, row, rowHeight, rowId, treeDepth, sortModel.length]);
  var sizes = apiRef.current.unstable_getRowInternalSizes(rowId);
  var minHeight = rowHeight;

  if (minHeight === 'auto' && sizes) {
    var numberOfBaseSizes = 0;
    var maximumSize = Object.entries(sizes).reduce(function (acc, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          size = _ref4[1];

      var isBaseHeight = /^base[A-Z]/.test(key);

      if (!isBaseHeight) {
        return acc;
      }

      numberOfBaseSizes += 1;

      if (size > acc) {
        return size;
      }

      return acc;
    }, 0);

    if (maximumSize > 0 && numberOfBaseSizes > 1) {
      minHeight = maximumSize;
    }
  }

  var style = _extends({}, styleProp, {
    maxHeight: rowHeight === 'auto' ? 'none' : rowHeight,
    // max-height doesn't support "auto"
    minHeight: minHeight
  });

  if (sizes != null && sizes.spacingTop) {
    var property = rootProps.rowSpacingType === 'border' ? 'borderTopWidth' : 'marginTop';
    style[property] = sizes.spacingTop;
  }

  if (sizes != null && sizes.spacingBottom) {
    var _property = rootProps.rowSpacingType === 'border' ? 'borderBottomWidth' : 'marginBottom';

    style[_property] = sizes.spacingBottom;
  }

  var rowClassNames = apiRef.current.unstable_applyPipeProcessors('rowClassName', [], rowId);

  if (typeof rootProps.getRowClassName === 'function') {
    var _currentPage$range;

    var indexRelativeToCurrentPage = index - (((_currentPage$range = currentPage.range) == null ? void 0 : _currentPage$range.firstRowIndex) || 0);

    var rowParams = _extends({}, apiRef.current.getRowParams(rowId), {
      isFirstVisible: indexRelativeToCurrentPage === 0,
      isLastVisible: indexRelativeToCurrentPage === currentPage.rows.length - 1,
      indexRelativeToCurrentPage: indexRelativeToCurrentPage
    });

    rowClassNames.push(rootProps.getRowClassName(rowParams));
  }

  var randomNumber = randomNumberBetween(10000, 20, 80);
  var cells = [];

  for (var i = 0; i < renderedColumns.length; i += 1) {
    var column = renderedColumns[i];
    var indexRelativeToAllColumns = firstColumnToRender + i;
    var isLastColumn = indexRelativeToAllColumns === visibleColumns.length - 1;
    var removeLastBorderRight = isLastColumn && hasScrollX && !hasScrollY;
    var showRightBorder = !isLastColumn ? rootProps.showCellRightBorder : !removeLastBorderRight && rootProps.disableExtendRowFullWidth;
    var cellColSpanInfo = apiRef.current.unstable_getCellColSpanInfo(rowId, indexRelativeToAllColumns);

    if (cellColSpanInfo && !cellColSpanInfo.spannedByColSpan) {
      if (row) {
        var _cellColSpanInfo$cell = cellColSpanInfo.cellProps,
            colSpan = _cellColSpanInfo$cell.colSpan,
            width = _cellColSpanInfo$cell.width;
        var cellProps = {
          width: width,
          colSpan: colSpan,
          showRightBorder: showRightBorder,
          indexRelativeToAllColumns: indexRelativeToAllColumns
        };
        cells.push(getCell(column, cellProps));
      } else {
        var _width = cellColSpanInfo.cellProps.width;
        var contentWidth = Math.round(randomNumber());
        cells.push( /*#__PURE__*/_jsx(rootProps.components.SkeletonCell, {
          width: _width,
          contentWidth: contentWidth,
          field: column.field,
          align: column.align
        }, column.field));
      }
    }
  }

  var emptyCellWidth = containerWidth - columnsTotalWidth;
  var eventHandlers = row ? {
    onClick: publishClick,
    onDoubleClick: publish('rowDoubleClick', onDoubleClick),
    onMouseEnter: publish('rowMouseEnter', onMouseEnter),
    onMouseLeave: publish('rowMouseLeave', onMouseLeave)
  } : null;
  return /*#__PURE__*/_jsxs("div", _extends({
    ref: handleRef,
    "data-id": rowId,
    "data-rowindex": index,
    role: "row",
    className: clsx.apply(void 0, _toConsumableArray(rowClassNames).concat([classes.root, className])),
    "aria-rowindex": ariaRowIndex,
    "aria-selected": selected,
    style: style
  }, eventHandlers, other, {
    children: [cells, emptyCellWidth > 0 && /*#__PURE__*/_jsx(EmptyCell, {
      width: emptyCellWidth
    })]
  }));
});
process.env.NODE_ENV !== "production" ? GridRow.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  cellFocus: PropTypes.object,
  cellTabIndex: PropTypes.object,
  containerWidth: PropTypes.number.isRequired,
  editRowsState: PropTypes.object.isRequired,
  firstColumnToRender: PropTypes.number.isRequired,

  /**
   * Index of the row in the whole sorted and filtered dataset.
   * If some rows above have expanded children, this index also take those children into account.
   */
  index: PropTypes.number.isRequired,
  isLastVisible: PropTypes.bool,
  lastColumnToRender: PropTypes.number.isRequired,
  position: PropTypes.oneOf(['center', 'left', 'right']).isRequired,
  renderedColumns: PropTypes.arrayOf(PropTypes.object).isRequired,
  row: PropTypes.object,
  rowHeight: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number]).isRequired,
  rowId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  selected: PropTypes.bool.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.object).isRequired
} : void 0;
export { GridRow };