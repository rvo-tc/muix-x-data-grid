var GridEvents;

(function (GridEvents) {
  GridEvents["resize"] = "resize";
  GridEvents["debouncedResize"] = "debouncedResize";
  GridEvents["viewportInnerSizeChange"] = "viewportInnerSizeChange";
  GridEvents["componentError"] = "componentError";
  GridEvents["unmount"] = "unmount";
  GridEvents["cellModeChange"] = "cellModeChange";
  GridEvents["cellClick"] = "cellClick";
  GridEvents["cellDoubleClick"] = "cellDoubleClick";
  GridEvents["cellMouseDown"] = "cellMouseDown";
  GridEvents["cellMouseUp"] = "cellMouseUp";
  GridEvents["cellKeyDown"] = "cellKeyDown";
  GridEvents["cellFocusIn"] = "cellFocusIn";
  GridEvents["cellFocusOut"] = "cellFocusOut";
  GridEvents["cellDragEnter"] = "cellDragEnter";
  GridEvents["cellDragOver"] = "cellDragOver";
  GridEvents["editCellPropsChange"] = "editCellPropsChange";
  GridEvents["cellEditCommit"] = "cellEditCommit";
  GridEvents["cellEditStart"] = "cellEditStart";
  GridEvents["cellEditStop"] = "cellEditStop";
  GridEvents["cellModesModelChange"] = "cellModesModelChange";
  GridEvents["rowModesModelChange"] = "rowModesModelChange";
  GridEvents["rowEditStart"] = "rowEditStart";
  GridEvents["rowEditStop"] = "rowEditStop";
  GridEvents["rowEditCommit"] = "rowEditCommit";
  GridEvents["cellNavigationKeyDown"] = "cellNavigationKeyDown";
  GridEvents["rowClick"] = "rowClick";
  GridEvents["rowDoubleClick"] = "rowDoubleClick";
  GridEvents["rowMouseEnter"] = "rowMouseEnter";
  GridEvents["rowMouseLeave"] = "rowMouseLeave";
  GridEvents["editRowsModelChange"] = "editRowsModelChange";
  GridEvents["rowDragStart"] = "rowDragStart";
  GridEvents["rowDragOver"] = "rowDragOver";
  GridEvents["rowDragEnd"] = "rowDragEnd";
  GridEvents["columnHeaderBlur"] = "columnHeaderBlur";
  GridEvents["columnHeaderFocus"] = "columnHeaderFocus";
  GridEvents["columnHeaderNavigationKeyDown"] = "columnHeaderNavigationKeyDown";
  GridEvents["columnHeaderKeyDown"] = "columnHeaderKeyDown";
  GridEvents["columnHeaderClick"] = "columnHeaderClick";
  GridEvents["columnHeaderDoubleClick"] = "columnHeaderDoubleClick";
  GridEvents["columnHeaderOver"] = "columnHeaderOver";
  GridEvents["columnHeaderOut"] = "columnHeaderOut";
  GridEvents["columnHeaderEnter"] = "columnHeaderEnter";
  GridEvents["columnHeaderLeave"] = "columnHeaderLeave";
  GridEvents["columnHeaderDragStart"] = "columnHeaderDragStart";
  GridEvents["columnHeaderDragOver"] = "columnHeaderDragOver";
  GridEvents["columnHeaderDragEnter"] = "columnHeaderDragEnter";
  GridEvents["columnHeaderDragEnd"] = "columnHeaderDragEnd";
  GridEvents["selectionChange"] = "selectionChange";
  GridEvents["headerSelectionCheckboxChange"] = "headerSelectionCheckboxChange";
  GridEvents["rowSelectionCheckboxChange"] = "rowSelectionCheckboxChange";
  GridEvents["pageChange"] = "pageChange";
  GridEvents["pageSizeChange"] = "pageSizeChange";
  GridEvents["rowGroupingModelChange"] = "rowGroupingModelChange";
  GridEvents["aggregationModelChange"] = "aggregationModelChange";
  GridEvents["rowsScroll"] = "rowsScroll";
  GridEvents["rowsScrollEnd"] = "rowsScrollEnd";
  GridEvents["columnSeparatorMouseDown"] = "columnSeparatorMouseDown";
  GridEvents["columnResize"] = "columnResize";
  GridEvents["columnWidthChange"] = "columnWidthChange";
  GridEvents["columnResizeStart"] = "columnResizeStart";
  GridEvents["columnResizeStop"] = "columnResizeStop";
  GridEvents["columnOrderChange"] = "columnOrderChange";
  GridEvents["rowOrderChange"] = "rowOrderChange";
  GridEvents["rowsSet"] = "rowsSet";
  GridEvents["rowExpansionChange"] = "rowExpansionChange";
  GridEvents["sortedRowsSet"] = "sortedRowsSet";
  GridEvents["filteredRowsSet"] = "filteredRowsSet";
  GridEvents["columnsChange"] = "columnsChange";
  GridEvents["detailPanelsExpandedRowIdsChange"] = "detailPanelsExpandedRowIdsChange";
  GridEvents["pinnedColumnsChange"] = "pinnedColumnsChange";
  GridEvents["activeStrategyProcessorChange"] = "activeStrategyProcessorChange";
  GridEvents["strategyAvailabilityChange"] = "strategyAvailabilityChange";
  GridEvents["sortModelChange"] = "sortModelChange";
  GridEvents["filterModelChange"] = "filterModelChange";
  GridEvents["columnVisibilityModelChange"] = "columnVisibilityModelChange";
  GridEvents["stateChange"] = "stateChange";
  GridEvents["columnVisibilityChange"] = "columnVisibilityChange";
  GridEvents["virtualScrollerContentSizeChange"] = "virtualScrollerContentSizeChange";
  GridEvents["virtualScrollerWheel"] = "virtualScrollerWheel";
  GridEvents["virtualScrollerTouchMove"] = "virtualScrollerTouchMove";
  GridEvents["preferencePanelClose"] = "preferencePanelClose";
  GridEvents["preferencePanelOpen"] = "preferencePanelOpen";
  GridEvents["menuOpen"] = "menuOpen";
  GridEvents["menuClose"] = "menuClose";
  GridEvents["renderedRowsIntervalChange"] = "renderedRowsIntervalChange";
  GridEvents["fetchRows"] = "fetchRows";
})(GridEvents || (GridEvents = {}));

export { GridEvents };