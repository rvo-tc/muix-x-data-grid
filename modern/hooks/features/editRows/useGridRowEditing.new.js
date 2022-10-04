import _toPropertyKey from "@babel/runtime/helpers/esm/toPropertyKey";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import _extends from "@babel/runtime/helpers/esm/extends";
const _excluded = ["id"],
      _excluded2 = ["id"];
import * as React from 'react';
import { unstable_useEventCallback as useEventCallback } from '@mui/utils';
import { useGridApiEventHandler, useGridApiOptionHandler, GridSignature } from '../../utils/useGridApiEventHandler';
import { GridEditModes, GridRowModes } from '../../../models/gridEditRowModel';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { gridEditRowsStateSelector } from './gridEditRowsSelector';
import { isPrintableKey } from '../../../utils/keyboardUtils';
import { gridColumnFieldsSelector } from '../columns/gridColumnsSelector';
import { buildWarning } from '../../../utils/warning';
import { gridRowsIdToIdLookupSelector } from '../rows/gridRowsSelector';
import { deepClone } from '../../../utils/utils';
import { GridRowEditStopReasons, GridRowEditStartReasons } from '../../../models/params/gridRowParams';
const missingOnProcessRowUpdateErrorWarning = buildWarning(['MUI: A call to `processRowUpdate` threw an error which was not handled because `onProcessRowUpdateError` is missing.', 'To handle the error pass a callback to the `onProcessRowUpdateError` prop, e.g. `<DataGrid onProcessRowUpdateError={(error) => ...} />`.', 'For more detail, see http://mui.com/components/data-grid/editing/#persistence.'], 'error');
export const useGridRowEditing = (apiRef, props) => {
  const [rowModesModel, setRowModesModel] = React.useState({});
  const rowModesModelRef = React.useRef(rowModesModel);
  const prevRowModesModel = React.useRef({});
  const focusTimeout = React.useRef(null);
  const nextFocusedCell = React.useRef(null);
  const {
    processRowUpdate,
    onProcessRowUpdateError,
    rowModesModel: rowModesModelProp,
    onRowModesModelChange,
    signature
  } = props;

  const runIfEditModeIsRow = callback => (...args) => {
    if (props.editMode === GridEditModes.Row) {
      callback(...args);
    }
  };

  const throwIfNotEditable = React.useCallback((id, field) => {
    const params = apiRef.current.getCellParams(id, field);

    if (!apiRef.current.isCellEditable(params)) {
      throw new Error(`MUI: The cell with id=${id} and field=${field} is not editable.`);
    }
  }, [apiRef]);
  const throwIfNotInMode = React.useCallback((id, mode) => {
    if (apiRef.current.getRowMode(id) !== mode) {
      throw new Error(`MUI: The row with id=${id} is not in ${mode} mode.`);
    }
  }, [apiRef]);
  const handleCellDoubleClick = React.useCallback((params, event) => {
    if (!params.isEditable) {
      return;
    }

    if (apiRef.current.getRowMode(params.id) === GridRowModes.Edit) {
      return;
    }

    const rowParams = apiRef.current.getRowParams(params.id);

    const newParams = _extends({}, rowParams, {
      field: params.field,
      reason: GridRowEditStartReasons.cellDoubleClick
    });

    apiRef.current.publishEvent('rowEditStart', newParams, event);
  }, [apiRef]);
  const handleCellFocusIn = React.useCallback(params => {
    nextFocusedCell.current = params;
  }, []);
  const handleCellFocusOut = React.useCallback((params, event) => {
    if (!params.isEditable) {
      return;
    }

    if (apiRef.current.getRowMode(params.id) === GridRowModes.View) {
      return;
    } // The mechanism to detect if we can stop editing a row is different from
    // the cell editing. Instead of triggering it when clicking outside a cell,
    // we must check if another cell in the same row was not clicked. To achieve
    // that, first we keep track of all cells that gained focus. When a cell loses
    // focus we check if the next cell that received focus is from a different row.


    nextFocusedCell.current = null;
    focusTimeout.current = setTimeout(() => {
      focusTimeout.current = null;

      if (nextFocusedCell.current?.id !== params.id) {
        // The row might have been deleted during the click
        if (!apiRef.current.getRow(params.id)) {
          return;
        } // The row may already changed its mode


        if (apiRef.current.getRowMode(params.id) === GridRowModes.View) {
          return;
        }

        const rowParams = apiRef.current.getRowParams(params.id);

        const newParams = _extends({}, rowParams, {
          field: params.field,
          reason: GridRowEditStopReasons.rowFocusOut
        });

        apiRef.current.publishEvent('rowEditStop', newParams, event);
      }
    });
  }, [apiRef]);
  React.useEffect(() => {
    return () => {
      clearTimeout(focusTimeout.current);
    };
  }, []);
  const handleCellKeyDown = React.useCallback((params, event) => {
    if (params.cellMode === GridRowModes.Edit) {
      // Wait until IME is settled for Asian languages like Japanese and Chinese
      // TODO: `event.which` is depricated but this is a temporary workaround
      if (event.which === 229) {
        return;
      }

      let reason;

      if (event.key === 'Escape') {
        reason = GridRowEditStopReasons.escapeKeyDown;
      } else if (event.key === 'Enter') {
        reason = GridRowEditStopReasons.enterKeyDown;
      } else if (event.key === 'Tab') {
        const columnFields = gridColumnFieldsSelector(apiRef).filter(field => apiRef.current.isCellEditable(apiRef.current.getCellParams(params.id, field)));

        if (event.shiftKey) {
          if (params.field === columnFields[0]) {
            // Exit if user pressed Shift+Tab on the first field
            reason = GridRowEditStopReasons.shiftTabKeyDown;
          }
        } else if (params.field === columnFields[columnFields.length - 1]) {
          // Exit if user pressed Tab on the last field
          reason = GridRowEditStopReasons.tabKeyDown;
        }

        if (reason) {
          event.preventDefault(); // Prevent going to the next element in the tab sequence
        }
      }

      if (reason) {
        const rowParams = apiRef.current.getRowParams(params.id);

        const newParams = _extends({}, rowParams, {
          reason,
          field: params.field
        });

        apiRef.current.publishEvent('rowEditStop', newParams, event);
      }
    } else if (params.isEditable) {
      let reason;

      if (isPrintableKey(event)) {
        reason = GridRowEditStartReasons.printableKeyDown;
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        reason = GridRowEditStartReasons.printableKeyDown;
      } else if (event.key === 'Enter') {
        reason = GridRowEditStartReasons.enterKeyDown;
      } else if (event.key === 'Delete' || event.key === 'Backspace') {
        // Delete on Windows, Backspace on macOS
        reason = GridRowEditStartReasons.deleteKeyDown;
      }

      if (reason) {
        const rowParams = apiRef.current.getRowParams(params.id);

        const newParams = _extends({}, rowParams, {
          field: params.field,
          reason
        });

        apiRef.current.publishEvent('rowEditStart', newParams, event);
      }
    }
  }, [apiRef]);
  const handleRowEditStart = React.useCallback(params => {
    const {
      id,
      field,
      reason
    } = params;
    const startRowEditModeParams = {
      id,
      fieldToFocus: field
    };

    if (reason === GridRowEditStartReasons.deleteKeyDown || reason === GridRowEditStartReasons.printableKeyDown) {
      startRowEditModeParams.deleteValue = !!field;
    }

    apiRef.current.startRowEditMode(startRowEditModeParams);
  }, [apiRef]);
  const handleRowEditStop = React.useCallback(params => {
    const {
      id,
      reason,
      field
    } = params;
    apiRef.current.unstable_runPendingEditCellValueMutation(id);
    let cellToFocusAfter;

    if (reason === GridRowEditStopReasons.enterKeyDown) {
      cellToFocusAfter = 'below';
    } else if (reason === GridRowEditStopReasons.tabKeyDown) {
      cellToFocusAfter = 'right';
    } else if (reason === GridRowEditStopReasons.shiftTabKeyDown) {
      cellToFocusAfter = 'left';
    }

    let ignoreModifications = reason === 'escapeKeyDown';
    const editingState = gridEditRowsStateSelector(apiRef.current.state);

    if (!ignoreModifications && !props.disableIgnoreModificationsIfProcessingProps) {
      // The user wants to stop editing the cell but we can't wait for the props to be processed.
      // In this case, discard the modifications if any field is processing its props.
      ignoreModifications = Object.values(editingState[id]).some(fieldProps => {
        return fieldProps.isProcessingProps;
      });
    }

    apiRef.current.stopRowEditMode({
      id,
      ignoreModifications,
      field,
      cellToFocusAfter
    });
  }, [apiRef, props.disableIgnoreModificationsIfProcessingProps]);
  useGridApiEventHandler(apiRef, 'cellDoubleClick', runIfEditModeIsRow(handleCellDoubleClick));
  useGridApiEventHandler(apiRef, 'cellFocusIn', runIfEditModeIsRow(handleCellFocusIn));
  useGridApiEventHandler(apiRef, 'cellFocusOut', runIfEditModeIsRow(handleCellFocusOut));
  useGridApiEventHandler(apiRef, 'cellKeyDown', runIfEditModeIsRow(handleCellKeyDown));
  useGridApiEventHandler(apiRef, 'rowEditStart', runIfEditModeIsRow(handleRowEditStart));
  useGridApiEventHandler(apiRef, 'rowEditStop', runIfEditModeIsRow(handleRowEditStop));
  useGridApiOptionHandler(apiRef, 'rowEditStart', props.onRowEditStart);
  useGridApiOptionHandler(apiRef, 'rowEditStop', props.onRowEditStop);
  const getRowMode = React.useCallback(id => {
    if (props.editMode === GridEditModes.Cell) {
      return GridRowModes.View;
    }

    const editingState = gridEditRowsStateSelector(apiRef.current.state);
    const isEditing = editingState[id] && Object.keys(editingState[id]).length > 0;
    return isEditing ? GridRowModes.Edit : GridRowModes.View;
  }, [apiRef, props.editMode]);
  const updateRowModesModel = useEventCallback(newModel => {
    const isNewModelDifferentFromProp = newModel !== props.rowModesModel;

    if (onRowModesModelChange && isNewModelDifferentFromProp) {
      const details = signature === GridSignature.DataGridPro ? {
        api: apiRef.current
      } : {};
      onRowModesModelChange(newModel, details);
    }

    if (props.rowModesModel && isNewModelDifferentFromProp) {
      return; // The prop always win
    }

    setRowModesModel(newModel);
    rowModesModelRef.current = newModel;
    apiRef.current.publishEvent('rowModesModelChange', newModel);
  });
  const updateRowInRowModesModel = React.useCallback((id, newProps) => {
    const newModel = _extends({}, rowModesModelRef.current);

    if (newProps !== null) {
      newModel[id] = _extends({}, newProps);
    } else {
      delete newModel[id];
    }

    updateRowModesModel(newModel);
  }, [updateRowModesModel]);
  const updateOrDeleteRowState = React.useCallback((id, newProps) => {
    apiRef.current.setState(state => {
      const newEditingState = _extends({}, state.editRows);

      if (newProps !== null) {
        newEditingState[id] = newProps;
      } else {
        delete newEditingState[id];
      }

      return _extends({}, state, {
        editRows: newEditingState
      });
    });
    apiRef.current.forceUpdate();
  }, [apiRef]);
  const updateOrDeleteFieldState = React.useCallback((id, field, newProps) => {
    apiRef.current.setState(state => {
      const newEditingState = _extends({}, state.editRows);

      if (newProps !== null) {
        newEditingState[id] = _extends({}, newEditingState[id], {
          [field]: _extends({}, newProps)
        });
      } else {
        delete newEditingState[id][field];

        if (Object.keys(newEditingState[id]).length === 0) {
          delete newEditingState[id];
        }
      }

      return _extends({}, state, {
        editRows: newEditingState
      });
    });
    apiRef.current.forceUpdate();
  }, [apiRef]);
  const startRowEditMode = React.useCallback(params => {
    const {
      id
    } = params,
          other = _objectWithoutPropertiesLoose(params, _excluded);

    throwIfNotInMode(id, GridRowModes.View);
    updateRowInRowModesModel(id, _extends({
      mode: GridRowModes.Edit
    }, other));
  }, [throwIfNotInMode, updateRowInRowModesModel]);
  const updateStateToStartRowEditMode = useEventCallback(params => {
    const {
      id,
      fieldToFocus,
      deleteValue
    } = params;
    const columnFields = gridColumnFieldsSelector(apiRef);
    const newProps = columnFields.reduce((acc, field) => {
      const cellParams = apiRef.current.getCellParams(id, field);

      if (!cellParams.isEditable) {
        return acc;
      }

      const shouldDeleteValue = deleteValue && fieldToFocus === field;
      acc[field] = {
        value: shouldDeleteValue ? '' : apiRef.current.getCellValue(id, field),
        error: false,
        isProcessingProps: false
      };
      return acc;
    }, {});
    updateOrDeleteRowState(id, newProps);

    if (fieldToFocus) {
      apiRef.current.setCellFocus(id, fieldToFocus);
    }
  });
  const stopRowEditMode = React.useCallback(params => {
    const {
      id
    } = params,
          other = _objectWithoutPropertiesLoose(params, _excluded2);

    throwIfNotInMode(id, GridRowModes.Edit);
    updateRowInRowModesModel(id, _extends({
      mode: GridRowModes.View
    }, other));
  }, [throwIfNotInMode, updateRowInRowModesModel]);
  const updateStateToStopRowEditMode = useEventCallback(params => {
    const {
      id,
      ignoreModifications,
      field: focusedField,
      cellToFocusAfter = 'none'
    } = params;
    apiRef.current.unstable_runPendingEditCellValueMutation(id);

    const finishRowEditMode = () => {
      if (cellToFocusAfter !== 'none' && focusedField) {
        apiRef.current.unstable_moveFocusToRelativeCell(id, focusedField, cellToFocusAfter);
      }

      updateOrDeleteRowState(id, null);
      updateRowInRowModesModel(id, null);
    };

    if (ignoreModifications) {
      finishRowEditMode();
      return;
    }

    const editingState = gridEditRowsStateSelector(apiRef.current.state);
    const row = apiRef.current.getRow(id);
    const isSomeFieldProcessingProps = Object.values(editingState[id]).some(fieldProps => fieldProps.isProcessingProps);

    if (isSomeFieldProcessingProps) {
      prevRowModesModel.current[id].mode = GridRowModes.Edit;
      return;
    }

    const hasSomeFieldWithError = Object.values(editingState[id]).some(fieldProps => fieldProps.error);

    if (hasSomeFieldWithError) {
      prevRowModesModel.current[id].mode = GridRowModes.Edit; // Revert the mode in the rowModesModel prop back to "edit"

      updateRowInRowModesModel(id, {
        mode: GridRowModes.Edit
      });
      return;
    }

    const rowUpdate = apiRef.current.unstable_getRowWithUpdatedValuesFromRowEditing(id);

    if (processRowUpdate) {
      const handleError = errorThrown => {
        prevRowModesModel.current[id].mode = GridRowModes.Edit; // Revert the mode in the rowModesModel prop back to "edit"

        updateRowInRowModesModel(id, {
          mode: GridRowModes.Edit
        });

        if (onProcessRowUpdateError) {
          onProcessRowUpdateError(errorThrown);
        } else {
          missingOnProcessRowUpdateErrorWarning();
        }
      };

      try {
        Promise.resolve(processRowUpdate(rowUpdate, row)).then(finalRowUpdate => {
          apiRef.current.updateRows([finalRowUpdate]);
          finishRowEditMode();
        }).catch(handleError);
      } catch (errorThrown) {
        handleError(errorThrown);
      }
    } else {
      apiRef.current.updateRows([rowUpdate]);
      finishRowEditMode();
    }
  });
  const setRowEditingEditCellValue = React.useCallback(params => {
    const {
      id,
      field,
      value,
      debounceMs,
      unstable_skipValueParser: skipValueParser
    } = params;
    throwIfNotEditable(id, field);
    const column = apiRef.current.getColumn(field);
    const row = apiRef.current.getRow(id);
    let parsedValue = value;

    if (column.valueParser && !skipValueParser) {
      parsedValue = column.valueParser(value, apiRef.current.getCellParams(id, field));
    }

    let editingState = gridEditRowsStateSelector(apiRef.current.state);

    let newProps = _extends({}, editingState[id][field], {
      value: parsedValue,
      changeReason: debounceMs ? 'debouncedSetEditCellValue' : 'setEditCellValue'
    });

    if (!column.preProcessEditCellProps) {
      updateOrDeleteFieldState(id, field, newProps);
    }

    return new Promise(resolve => {
      const promises = [];

      if (column.preProcessEditCellProps) {
        const hasChanged = newProps.value !== editingState[id][field].value;
        newProps = _extends({}, newProps, {
          isProcessingProps: true
        });
        updateOrDeleteFieldState(id, field, newProps);

        const _editingState$id = editingState[id],
              otherFieldsProps = _objectWithoutPropertiesLoose(_editingState$id, [field].map(_toPropertyKey));

        const promise = Promise.resolve(column.preProcessEditCellProps({
          id,
          row,
          props: newProps,
          hasChanged,
          otherFieldsProps
        })).then(processedProps => {
          // Check again if the row is in edit mode because the user may have
          // discarded the changes while the props were being processed.
          if (apiRef.current.getRowMode(id) === GridRowModes.View) {
            resolve(false);
            return;
          }

          editingState = gridEditRowsStateSelector(apiRef.current.state);
          processedProps = _extends({}, processedProps, {
            isProcessingProps: false
          }); // We don't reuse the value from the props pre-processing because when the
          // promise resolves it may be already outdated. The only exception to this rule
          // is when there's no pre-processing.

          processedProps.value = column.preProcessEditCellProps ? editingState[id][field].value : parsedValue;
          updateOrDeleteFieldState(id, field, processedProps);
        });
        promises.push(promise);
      }

      Object.entries(editingState[id]).forEach(([thisField, fieldProps]) => {
        if (thisField === field) {
          return;
        }

        const fieldColumn = apiRef.current.getColumn(thisField);

        if (!fieldColumn.preProcessEditCellProps) {
          return;
        }

        fieldProps = _extends({}, fieldProps, {
          isProcessingProps: true
        });
        updateOrDeleteFieldState(id, thisField, fieldProps);
        editingState = gridEditRowsStateSelector(apiRef.current.state);

        const _editingState$id2 = editingState[id],
              otherFieldsProps = _objectWithoutPropertiesLoose(_editingState$id2, [thisField].map(_toPropertyKey));

        const promise = Promise.resolve(fieldColumn.preProcessEditCellProps({
          id,
          row,
          props: fieldProps,
          hasChanged: false,
          otherFieldsProps
        })).then(processedProps => {
          // Check again if the row is in edit mode because the user may have
          // discarded the changes while the props were being processed.
          if (apiRef.current.getRowMode(id) === GridRowModes.View) {
            resolve(false);
            return;
          }

          processedProps = _extends({}, processedProps, {
            isProcessingProps: false
          });
          updateOrDeleteFieldState(id, thisField, processedProps);
        });
        promises.push(promise);
      });
      Promise.all(promises).then(() => {
        if (apiRef.current.getRowMode(id) === GridRowModes.Edit) {
          editingState = gridEditRowsStateSelector(apiRef.current.state);
          resolve(!editingState[id][field].error);
        } else {
          resolve(false);
        }
      });
    });
  }, [apiRef, throwIfNotEditable, updateOrDeleteFieldState]);
  const getRowWithUpdatedValuesFromRowEditing = React.useCallback(id => {
    const editingState = gridEditRowsStateSelector(apiRef.current.state);
    const row = apiRef.current.getRow(id);

    let rowUpdate = _extends({}, row);

    Object.entries(editingState[id]).forEach(([field, fieldProps]) => {
      const column = apiRef.current.getColumn(field);

      if (column.valueSetter) {
        rowUpdate = column.valueSetter({
          value: fieldProps.value,
          row: rowUpdate
        });
      } else {
        rowUpdate[field] = fieldProps.value;
      }
    });
    return rowUpdate;
  }, [apiRef]);
  const editingApi = {
    getRowMode,
    startRowEditMode,
    stopRowEditMode,
    unstable_setRowEditingEditCellValue: setRowEditingEditCellValue,
    unstable_getRowWithUpdatedValuesFromRowEditing: getRowWithUpdatedValuesFromRowEditing
  };
  useGridApiMethod(apiRef, editingApi, 'EditingApi');
  React.useEffect(() => {
    if (rowModesModelProp) {
      updateRowModesModel(rowModesModelProp);
    }
  }, [rowModesModelProp, updateRowModesModel]);
  React.useEffect(() => {
    const idToIdLookup = gridRowsIdToIdLookupSelector(apiRef); // Update the ref here because updateStateToStopRowEditMode may change it later

    const copyOfPrevRowModesModel = prevRowModesModel.current;
    prevRowModesModel.current = deepClone(rowModesModel); // Do a deep-clone because the attributes might be changed later

    Object.entries(rowModesModel).forEach(([id, params]) => {
      const prevMode = copyOfPrevRowModesModel[id]?.mode || GridRowModes.View;
      const originalId = idToIdLookup[id] ?? id;

      if (params.mode === GridRowModes.Edit && prevMode === GridRowModes.View) {
        updateStateToStartRowEditMode(_extends({
          id: originalId
        }, params));
      } else if (params.mode === GridRowModes.View && prevMode === GridRowModes.Edit) {
        updateStateToStopRowEditMode(_extends({
          id: originalId
        }, params));
      }
    });
  }, [apiRef, rowModesModel, updateStateToStartRowEditMode, updateStateToStopRowEditMode]);
};