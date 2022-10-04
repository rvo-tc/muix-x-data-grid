"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColumnsToExport = exports.defaultGetRowsToExport = void 0;

var _columns = require("../columns");

var _filter = require("../filter");

var _gridRowsSelector = require("../rows/gridRowsSelector");

const getColumnsToExport = ({
  apiRef,
  options
}) => {
  const columns = (0, _columns.gridColumnDefinitionsSelector)(apiRef);

  if (options.fields) {
    return options.fields.map(field => columns.find(column => column.field === field)).filter(column => !!column);
  }

  const validColumns = options.allColumns ? columns : (0, _columns.gridVisibleColumnDefinitionsSelector)(apiRef);
  return validColumns.filter(column => !column.disableExport);
};

exports.getColumnsToExport = getColumnsToExport;

const defaultGetRowsToExport = ({
  apiRef
}) => {
  var _pinnedRows$top, _pinnedRows$bottom;

  const filteredSortedRowIds = (0, _filter.gridFilteredSortedRowIdsSelector)(apiRef);
  const rowTree = (0, _gridRowsSelector.gridRowTreeSelector)(apiRef);
  const selectedRows = apiRef.current.getSelectedRows();
  const bodyRows = filteredSortedRowIds.filter(id => {
    var _rowTree$id$position;

    return ((_rowTree$id$position = rowTree[id].position) != null ? _rowTree$id$position : 'body') === 'body';
  });
  const pinnedRows = (0, _gridRowsSelector.gridPinnedRowsSelector)(apiRef);
  const topPinnedRowsIds = (pinnedRows == null ? void 0 : (_pinnedRows$top = pinnedRows.top) == null ? void 0 : _pinnedRows$top.map(row => row.id)) || [];
  const bottomPinnedRowsIds = (pinnedRows == null ? void 0 : (_pinnedRows$bottom = pinnedRows.bottom) == null ? void 0 : _pinnedRows$bottom.map(row => row.id)) || [];
  bodyRows.unshift(...topPinnedRowsIds);
  bodyRows.push(...bottomPinnedRowsIds);

  if (selectedRows.size > 0) {
    return bodyRows.filter(id => selectedRows.has(id));
  }

  return bodyRows;
};

exports.defaultGetRowsToExport = defaultGetRowsToExport;